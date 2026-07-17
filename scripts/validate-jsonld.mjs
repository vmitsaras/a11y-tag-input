import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const excludedDirectories = new Set([
  ".git",
  "build",
  "dist",
  "node_modules",
  "out",
  "pages-dist"
]);
const htmlFiles = (await findHtmlFiles(root)).sort();
let publicPageCount = 0;
let omittedPageCount = 0;

for (const htmlFile of htmlFiles) {
  const relativePath = relative(root, htmlFile).split(sep).join("/");
  const isPublicPage =
    relativePath === "docs/index.html" ||
    relativePath.startsWith("examples/") ||
    relativePath.startsWith("docs/examples/");
  const isIntentionalOmission =
    relativePath === "docs/404.html" || relativePath.startsWith("test/fixtures/");
  const html = await readFile(htmlFile, "utf8");
  const head = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0] ?? "";
  const blocks = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  ];

  if (isPublicPage) {
    validatePublicPage(relativePath, head, blocks);
    publicPageCount += 1;
    console.log(`validated ${relativePath}`);
    continue;
  }

  if (isIntentionalOmission) {
    if (blocks.length !== 0) {
      throw new Error(`Expected no JSON-LD on intentionally omitted page ${relativePath}`);
    }

    if (relativePath === "docs/404.html" && !/name=["']robots["'][^>]*noindex/i.test(head)) {
      throw new Error("The generated 404 page must remain noindex");
    }

    omittedPageCount += 1;
    console.log(`intentionally omitted ${relativePath}`);
    continue;
  }

  throw new Error(`Unclassified HTML source: ${relativePath}`);
}

console.log(
  `JSON-LD validation passed for ${publicPageCount} public pages; ${omittedPageCount} non-public or error pages were intentionally omitted.`
);

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
        return [];
      }

      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        return findHtmlFiles(path);
      }

      return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
    })
  );

  return files.flat();
}

function validatePublicPage(relativePath, head, blocks) {
  if (!head || blocks.length !== 1 || !head.includes(blocks[0][0])) {
    throw new Error(`Expected exactly one JSON-LD block in <head> for ${relativePath}`);
  }

  const schema = JSON.parse(blocks[0][1]);
  const canonicalUrl = extractLinkHref(head, "canonical");
  const pageTitle = decodeHtml(extractElementText(head, "title"));
  const pageDescription = decodeHtml(extractMetaContent(head, "description"));
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
  const webPage = graph.find((node) => node?.["@type"] === "WebPage");
  const software = graph.find((node) => node?.["@type"] === "SoftwareSourceCode");

  if (schema["@context"] !== "https://schema.org" || !webPage || !software) {
    throw new Error(`Missing required schema graph nodes in ${relativePath}`);
  }

  if (!canonicalUrl.startsWith("https://") || webPage.url !== canonicalUrl) {
    throw new Error(`WebPage URL does not match the public canonical URL in ${relativePath}`);
  }

  if (
    webPage["@id"] !== `${canonicalUrl}#webpage` ||
    software["@id"] !== `${canonicalUrl}#software` ||
    webPage.mainEntity?.["@id"] !== software["@id"]
  ) {
    throw new Error(`Page-specific IDs are inconsistent in ${relativePath}`);
  }

  if (webPage.name !== pageTitle || webPage.description !== pageDescription) {
    throw new Error(`WebPage name or description does not match visible metadata in ${relativePath}`);
  }

  const serializedSchema = JSON.stringify(schema);

  if (/localhost|\/Users\/|file:\/\//i.test(serializedSchema)) {
    throw new Error(`Private or local URL found in ${relativePath}`);
  }

  if (containsDisallowedType(schema)) {
    throw new Error(`Unsupported commercial or review schema found in ${relativePath}`);
  }
}

function containsDisallowedType(value) {
  if (Array.isArray(value)) return value.some(containsDisallowedType);
  if (!value || typeof value !== "object") return false;

  const disallowedTypes = new Set(["AggregateRating", "Offer", "Product", "Review"]);

  if (disallowedTypes.has(value["@type"])) return true;
  return Object.values(value).some(containsDisallowedType);
}

function extractElementText(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1]?.trim() ?? "";
}

function extractMetaContent(head, name) {
  const tag = head.match(
    new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i")
  )?.[0];

  return extractAttribute(tag, "content");
}

function extractLinkHref(head, rel) {
  const tag = head.match(
    new RegExp(`<link\\b(?=[^>]*\\brel=["']${rel}["'])[^>]*>`, "i")
  )?.[0];

  return extractAttribute(tag, "href");
}

function extractAttribute(tag, attribute) {
  if (!tag) return "";

  return tag.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, "i"))?.[1]?.trim() ?? "";
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
