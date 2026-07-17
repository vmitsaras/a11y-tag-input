import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const examplesRoot = resolve(root, "examples");
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const readme = await readFile(resolve(root, "README.md"), "utf8");
const repositoryUrl = normalizeRepositoryUrl(packageJson.repository);
const [repositoryOwner, repositoryName] = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
const pagesBaseUrl = `https://${repositoryOwner}.github.io/${repositoryName}/`;
const packageDisplayName = readme.match(/^#\s+(.+)$/m)?.[1]?.trim() || packageJson.name;
const authorName =
  typeof packageJson.author === "string" ? packageJson.author : packageJson.author?.name;
const knownAuthor = authorName === "Vasileios Mitsaras";
const authorId = `${pagesBaseUrl}#author`;
const sourceFiles = (await findHtmlFiles(examplesRoot)).sort();

for (const sourceFile of sourceFiles) {
  const originalHtml = await readFile(sourceFile, "utf8");
  const headMatch = originalHtml.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);

  if (!headMatch) {
    throw new Error(`Missing <head> in ${relative(root, sourceFile)}`);
  }

  let head = headMatch[0];
  const pageTitle = decodeHtml(extractElementText(head, "title"));
  const pageDescription = decodeHtml(extractMetaContent(head, "description"));
  const derivedPageUrl = getPageUrl(sourceFile);
  const canonicalUrl = extractLinkHref(head, "canonical") || derivedPageUrl;

  if (!pageTitle || !pageDescription) {
    throw new Error(`Missing title or meta description in ${relative(root, sourceFile)}`);
  }

  if (!canonicalUrl.startsWith("https://")) {
    throw new Error(`Canonical URL must be public and absolute in ${relative(root, sourceFile)}`);
  }

  head = ensureIndexMetadata(head, canonicalUrl);
  head = removeJsonLd(head);
  head = insertJsonLd(head, renderJsonLd(canonicalUrl, pageTitle, pageDescription));

  const updatedHtml = originalHtml.replace(headMatch[0], head);
  const jsonLdBlocks = updatedHtml.match(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi
  );

  if (jsonLdBlocks?.length !== 1) {
    throw new Error(`Expected one JSON-LD block in ${relative(root, sourceFile)}`);
  }

  if (updatedHtml !== originalHtml) {
    await writeFile(sourceFile, updatedHtml);
    console.log(`updated ${relative(root, sourceFile)}`);
  } else {
    console.log(`unchanged ${relative(root, sourceFile)}`);
  }
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        return findHtmlFiles(path);
      }

      return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
    })
  );

  return files.flat();
}

function normalizeRepositoryUrl(repository) {
  const raw = typeof repository === "string" ? repository : repository?.url ?? "";

  return raw
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/");
}

function getPageUrl(sourceFile) {
  const relativePath = relative(root, sourceFile).split(sep).join("/");
  const publicPath =
    basename(sourceFile).toLowerCase() === "index.html"
      ? `${relativePath.slice(0, -"index.html".length)}`
      : relativePath;

  return new URL(publicPath, pagesBaseUrl).href;
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

function ensureIndexMetadata(head, pageUrl) {
  let updatedHead = head;

  if (!/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i.test(updatedHead)) {
    updatedHead = insertAfter(
      updatedHead,
      /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
      '    <meta name="robots" content="index,follow">'
    );
  }

  if (!/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(updatedHead)) {
    updatedHead = insertAfter(
      updatedHead,
      /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
      `    <link rel="canonical" href="${pageUrl}">`
    );
  }

  return updatedHead;
}

function insertAfter(value, pattern, addition) {
  const match = value.match(pattern);

  if (!match || match.index === undefined) {
    throw new Error(`Unable to insert metadata after ${pattern}`);
  }

  const insertionIndex = match.index + match[0].length;
  return `${value.slice(0, insertionIndex)}\n${addition}${value.slice(insertionIndex)}`;
}

function removeJsonLd(head) {
  return head.replace(
    /\n?[ \t]*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>[ \t]*\n?/gi,
    "\n"
  );
}

function insertJsonLd(head, jsonLd) {
  const block = `    <script type="application/ld+json">\n${jsonLd}\n    </script>`;
  const stylesheetMatch = head.match(
    /[ \t]*<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/i
  );

  if (!stylesheetMatch || stylesheetMatch.index === undefined) {
    return head.replace(/\s*<\/head>/i, `\n${block}\n  </head>`);
  }

  return `${head.slice(0, stylesheetMatch.index).trimEnd()}\n${block}\n    ${head
    .slice(stylesheetMatch.index)
    .trimStart()}`;
}

function renderJsonLd(pageUrl, pageTitle, pageDescription) {
  const softwareId = `${pageUrl}#software`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      mainEntity: { "@id": softwareId }
    },
    cleanJsonLd({
      "@type": "SoftwareSourceCode",
      "@id": softwareId,
      name: packageDisplayName,
      description: packageJson.description,
      codeRepository: repositoryUrl,
      programmingLanguage: ["TypeScript", "JavaScript"],
      runtimePlatform: "Browser",
      version: packageJson.version,
      license: packageJson.license,
      keywords: packageJson.keywords,
      author: authorName ? { "@id": authorId } : undefined,
      targetProduct: {
        "@type": "SoftwareApplication",
        name: packageDisplayName,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        runtimePlatform: "Browser"
      },
      sameAs: [repositoryUrl]
    })
  ];

  if (authorName) {
    graph.push(
      cleanJsonLd({
        "@type": "Person",
        "@id": authorId,
        name: authorName,
        url: knownAuthor ? "https://github.com/vmitsaras/" : undefined,
        sameAs: knownAuthor
          ? ["https://github.com/vmitsaras/", "https://linkedin.com/in/vasilis-mitsaras"]
          : undefined
      })
    );
  }

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": graph
    },
    null,
    2
  )
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
}

function cleanJsonLd(value) {
  if (Array.isArray(value)) {
    const cleaned = value.map(cleanJsonLd).filter((item) => item !== undefined);
    return cleaned.length ? cleaned : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, nestedValue]) => [key, cleanJsonLd(nestedValue)])
      .filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== "");

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  return value === null || value === undefined || value === "" ? undefined : value;
}
