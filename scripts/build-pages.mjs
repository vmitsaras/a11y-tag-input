import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const docsRoot = resolve(root, "docs");
const distRoot = resolve(root, "dist");
const examplesRoot = resolve(root, "examples");
const formValidatorDistRoot = resolve(root, "node_modules", "a11y-form-validator", "dist");
const demoVendorRoot = resolve(root, "demo-vendor", "a11y-form-validator");
const docsVendorRoot = resolve(docsRoot, "demo-vendor", "a11y-form-validator");

const packageJson = JSON.parse(await readText(resolve(root, "package.json")));
const docsModule = await import(`${pathToFileURL(resolve(distRoot, "docs.js")).href}?t=${Date.now()}`);
const pluginDocs = docsModule.docs;
const repositoryUrl = normalizeRepositoryUrl(packageJson.repository);
const repositoryParts = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
const pagesBaseUrl = `https://${repositoryParts[0]}.github.io/${repositoryParts[1]}/`;
const npmUrl = typeof pluginDocs.npm === "string" ? pluginDocs.npm : "";
const documentationUrl = packageJson.homepage || `${repositoryUrl}#readme`;
const author = {
  name: packageJson.author,
  github: "https://github.com/vmitsaras/",
  linkedin: "https://linkedin.com/in/vasilis-mitsaras"
};

await mkdir(docsRoot, { recursive: true });
await rm(resolve(docsRoot, "dist"), { recursive: true, force: true });
await rm(resolve(docsRoot, "examples"), { recursive: true, force: true });
await rm(resolve(docsRoot, "demo-vendor"), { recursive: true, force: true });
await rm(resolve(docsRoot, "index.html"), { force: true });
await rm(resolve(docsRoot, "404.html"), { force: true });
await rm(resolve(docsRoot, "styles.css"), { force: true });

await cp(distRoot, resolve(docsRoot, "dist"), { recursive: true });
await cp(examplesRoot, resolve(docsRoot, "examples"), { recursive: true });
await rm(resolve(root, "demo-vendor"), { recursive: true, force: true });
await mkdir(demoVendorRoot, { recursive: true });
await mkdir(docsVendorRoot, { recursive: true });
await cp(formValidatorDistRoot, demoVendorRoot, { recursive: true });
await cp(formValidatorDistRoot, docsVendorRoot, { recursive: true });
await writeFile(resolve(docsRoot, ".nojekyll"), "");
await writeFile(resolve(docsRoot, "styles.css"), renderStyles());
await writeFile(resolve(docsRoot, "index.html"), renderIndex(pluginDocs, packageJson));
await writeFile(resolve(docsRoot, "404.html"), renderNotFound(pluginDocs));

async function readText(path) {
  return await import("node:fs/promises").then(({ readFile }) => readFile(path, "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeRepositoryUrl(repository) {
  const raw = typeof repository === "string" ? repository : repository?.url ?? "";

  return raw
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/");
}

function renderJsonLd(docs, pkg, pageUrl, pageTitle, pageDescription) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: pageTitle,
          description: pageDescription,
          mainEntity: { "@id": `${pageUrl}#software` }
        },
        {
          "@type": "SoftwareSourceCode",
          "@id": `${pageUrl}#software`,
          name: docs.name,
          description: docs.description,
          codeRepository: repositoryUrl,
          programmingLanguage: ["TypeScript", "JavaScript"],
          runtimePlatform: "Browser",
          version: pkg.version,
          license: pkg.license,
          keywords: pkg.keywords,
          author: { "@id": `${pagesBaseUrl}#author` },
          targetProduct: {
            "@type": "SoftwareApplication",
            name: docs.name,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            runtimePlatform: "Browser"
          },
          sameAs: [repositoryUrl, npmUrl].filter(Boolean)
        },
        {
          "@type": "Person",
          "@id": `${pagesBaseUrl}#author`,
          name: author.name,
          url: author.github,
          sameAs: [author.github, author.linkedin]
        }
      ]
    },
    null,
    2
  );
}

function renderIndex(docs, pkg) {
  const pageTitle = `Accessible Tag Input Demo | ${docs.name}`;
  const pageDescription =
    "Try a framework-agnostic tag input with keyboard navigation, validation feedback, native form syncing, and practical TypeScript examples.";
  const [basicExample, ...addonExamples] = docs.examples ?? [];
  const basicExampleCard = basicExample
    ? `<div class="demo-feature-card">
        <p class="demo-card-label">Start here</p>
        <h3><a href="${escapeHtml(`./${basicExample.path}/`)}">${escapeHtml(basicExample.name)}</a></h3>
        <p>${escapeHtml(basicExample.description)}</p>
      </div>`
    : "";
  const addonCards = addonExamples
    .map((example) => {
      const href = `./${example.path}/`;
      return `<li class="demo-card">
        <p class="demo-card-label">Addon recipe</p>
        <h3><a href="${escapeHtml(href)}">${escapeHtml(example.name)}</a></h3>
        <p>${escapeHtml(example.description)}</p>
      </li>`;
    })
    .join("\n");

  const optionRows = (docs.options ?? [])
    .map(
      (option) => `<tr>
        <th scope="row"><code>${escapeHtml(option.name)}</code></th>
        <td>${escapeHtml(option.default)}</td>
        <td>${escapeHtml(option.description)}</td>
      </tr>`
    )
    .join("\n");

  const limitationItems = (docs.limitations ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
  const installCommand = npmUrl ? `npm install ${docs.packageName}` : "npm install\nnpm run build";
  const installNote = npmUrl
    ? `The public package is available at <a href="${escapeHtml(npmUrl)}">npm</a>.`
    : "The npm package URL was not verified during this pass, so use a local workspace, packed tarball, or repository checkout until registry publication is confirmed.";
  const footerProjectLinks = [
    `<li class="demo-footer__item"><a class="demo-footer__link" href="${repositoryUrl}">GitHub repository</a></li>`,
    npmUrl ? `<li class="demo-footer__item"><a class="demo-footer__link" href="${npmUrl}">npm package</a></li>` : "",
    `<li class="demo-footer__item"><a class="demo-footer__link" href="${escapeHtml(documentationUrl)}">Documentation</a></li>`
  ]
    .filter(Boolean)
    .join("\n");

  const keyboardRows = (docs.keyboard ?? [])
    .map(
      (item) => `<tr>
        <th scope="row"><kbd>${escapeHtml(item.key)}</kbd></th>
        <td>${escapeHtml(item.description)}</td>
      </tr>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${pagesBaseUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escapeHtml(docs.name)}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(pageDescription)}">
    <meta property="og:url" content="${pagesBaseUrl}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}">
    <script type="application/ld+json">
${renderJsonLd(docs, pkg, pagesBaseUrl, pageTitle, pageDescription)}
    </script>
    <link rel="stylesheet" href="./dist/styles.css">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <a class="demo-skip" href="#demo">Skip to live demo</a>

    <nav class="demo-site-nav" aria-label="Main navigation">
      <a class="demo-site-nav__brand" href="./">${escapeHtml(docs.name)}</a>
      <ul class="demo-site-nav__links">
        <li><a href="./" aria-current="page">Home</a></li>
        <li><a href="#examples">Examples</a></li>
        <li><a href="${repositoryUrl}">GitHub</a></li>
      </ul>
    </nav>

    <header class="demo-hero">
      <div class="demo-hero__copy">
        <p class="demo-eyebrow">Accessible interaction / zero framework</p>
        <h1>${escapeHtml(docs.name)}</h1>
        <p class="demo-intro">${escapeHtml(docs.description)}</p>
        <p class="demo-meta">
          <span>${escapeHtml(docs.packageName)}</span>
          <span aria-hidden="true">/</span>
          <span>v${escapeHtml(pkg.version)}</span>
        </p>
        <div class="demo-actions" aria-label="Primary actions">
          <a class="demo-button" href="#demo">Try the live demo</a>
          <a class="demo-button demo-button--secondary" href="#install">Install and initialize</a>
        </div>
      </div>
      <div class="demo-hero__signal" aria-hidden="true">
        <span>TAG</span>
        <span class="demo-hero__token">keyboard-ready</span>
        <span class="demo-hero__token">native value</span>
      </div>
    </header>

    <nav class="demo-section-nav" aria-label="Demo sections">
      <ul>
        <li><a href="#demo">Live demo</a></li>
        <li><a href="#examples">Examples</a></li>
        <li><a href="#install">Install</a></li>
        <li><a href="#keyboard">Keyboard</a></li>
        <li><a href="#options">Options</a></li>
        <li><a href="#accessibility">Accessibility</a></li>
        <li><a href="#limitations">Limitations</a></li>
      </ul>
    </nav>

    <main class="demo-page">
      <section class="demo-section" id="demo" aria-labelledby="demo-title">
        <h2 id="demo-title">Live Demo</h2>
        <div class="demo-grid">
          <form class="demo-form">
            <div class="a11y-tag-input" data-a11y-tag-input-root>
              <label for="pages-demo-tags">Project tags</label>
              <p class="demo-help" id="pages-demo-help">
                Add up to five tags. Try Enter, comma, semicolon, Backspace from an empty field, and remove buttons.
              </p>
              <textarea
                id="pages-demo-tags"
                name="pages-demo-tags"
                data-a11y-tag-input
                data-max-tags="5"
                data-lowercase="true"
                aria-describedby="pages-demo-help"
              >accessibility,forms</textarea>
            </div>

            <button class="demo-button" type="submit">Show form value</button>
            <output class="demo-output" id="pages-demo-output" aria-label="Serialized textarea value" aria-live="polite">Not submitted yet.</output>
          </form>

          <aside class="demo-note" aria-labelledby="try-title">
            <h3 id="try-title">Try it</h3>
            <ul>
              <li>Type <code>Design</code> and press Enter.</li>
              <li>Type <code>Research;Forms</code> to add multiple tags.</li>
              <li>Press Backspace from an empty input to move to the last remove button.</li>
              <li>Submit the form to inspect the synchronized textarea value.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="demo-section" id="examples" aria-labelledby="examples-title">
        <h2 id="examples-title">Examples</h2>
        <p>Start with the basic demo, then use the ${addonExamples.length} addon recipes for focused integration patterns. Each page is static, framework-free, and imports the built package from <code>./dist/</code>.</p>
        ${basicExampleCard}
        <h3 class="demo-subheading">Addon recipes</h3>
        <ul class="demo-card-grid">
          ${addonCards}
        </ul>
      </section>

      <section class="demo-section" id="install" aria-labelledby="install-title">
        <h2 id="install-title">Install And Initialize</h2>
        <div class="demo-grid">
          <div>
            <h3>Install</h3>
            <pre><code>${escapeHtml(installCommand)}</code></pre>
            <p class="demo-warning">${installNote}</p>
          </div>
          <div>
            <h3>Initialize</h3>
            <pre><code>${escapeHtml(docs.usage)}</code></pre>
          </div>
        </div>
      </section>

      <section class="demo-section" id="keyboard" aria-labelledby="keyboard-title">
        <h2 id="keyboard-title">Keyboard Behavior</h2>
        <div class="demo-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Behavior</th>
              </tr>
            </thead>
            <tbody>
              ${keyboardRows}
            </tbody>
          </table>
        </div>
      </section>

      <section class="demo-section" id="options" aria-labelledby="options-title">
        <h2 id="options-title">Common Options</h2>
        <p>This table summarizes the documented option surface. See the README for the full API, methods, events, CSS hooks, and data attributes.</p>
        <div class="demo-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Option</th>
                <th scope="col">Default</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              ${optionRows}
            </tbody>
          </table>
        </div>
        <p class="demo-docs-link">
          <a href="${escapeHtml(documentationUrl)}">Open the complete README and API reference</a>.
        </p>
      </section>

      <section class="demo-section" id="accessibility" aria-labelledby="a11y-title">
        <h2 id="a11y-title">Accessibility Notes</h2>
        <ul>
          ${(docs.accessibility ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
        <p class="demo-warning">
          Test the final integration with your target browsers, devices, and assistive technologies.
        </p>
        <p>
          Manual review prompts are available in <a href="./accessibility-test-scenarios.md">accessibility-test-scenarios.md</a>.
          WCAG evidence notes are available in <a href="./wcag-evidence-map.md">wcag-evidence-map.md</a>.
        </p>
      </section>

      <section class="demo-section" id="limitations" aria-labelledby="limitations-title">
        <h2 id="limitations-title">Limitations</h2>
        <ul>
          ${limitationItems}
        </ul>
      </section>

      <section class="demo-section" aria-labelledby="deploy-title">
        <h2 id="deploy-title">GitHub Pages Deployment</h2>
        <p>
          This repository is prepared for branch publishing from <code>/docs</code>.
          In GitHub, use Settings -&gt; Pages -&gt; Build and deployment -&gt; Deploy from a branch -&gt; selected branch -&gt; <code>/docs</code>.
        </p>
      </section>
    </main>

    <footer class="demo-footer" data-demo-footer>
      <div class="demo-footer__inner">
        <div class="demo-footer__brand">
          <p class="demo-footer__eyebrow">Accessibility plugin demo</p>
          <p class="demo-footer__credit">
            <span class="demo-footer__plugin">${escapeHtml(docs.name)}</span>
            <span class="demo-footer__separator" aria-hidden="true">&middot;</span>
            Built by <a class="demo-footer__link" href="${author.github}">${escapeHtml(author.name)}</a>
            <span class="demo-footer__separator" aria-hidden="true">&middot;</span>
            <a class="demo-footer__link" href="${author.linkedin}">LinkedIn profile</a>
          </p>
          <p class="demo-footer__meta">
            <span>${escapeHtml(pkg.name)}</span>
            <span class="demo-footer__separator" aria-hidden="true">&middot;</span>
            <span>MIT License</span>
          </p>
        </div>
        <nav class="demo-footer__nav" aria-label="Project links">
          <ul class="demo-footer__links">
            ${footerProjectLinks}
          </ul>
        </nav>
      </div>
    </footer>

    <script type="module">
      import { createTagInput } from "./dist/index.js";

      const source = document.querySelector("#pages-demo-tags");
      const form = document.querySelector(".demo-form");
      const output = document.querySelector("#pages-demo-output");

      if (source instanceof HTMLTextAreaElement) {
        createTagInput(source, {
          maxTags: 5,
          lowercase: true
        });
      }

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (source instanceof HTMLTextAreaElement && output instanceof HTMLOutputElement) {
          output.textContent = source.value || "(empty)";
        }
      });
    </script>
  </body>
</html>
`;
}

function renderNotFound(docs) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Not Found | ${escapeHtml(docs.name)}</title>
    <meta name="robots" content="noindex,nofollow">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <a class="demo-skip" href="#main-content">Skip to content</a>

    <nav class="demo-site-nav" aria-label="Main navigation">
      <a class="demo-site-nav__brand" href="./">${escapeHtml(docs.name)}</a>
      <ul class="demo-site-nav__links">
        <li><a href="./">Home</a></li>
        <li><a href="./#examples">Examples</a></li>
        <li><a href="${repositoryUrl}">GitHub</a></li>
      </ul>
    </nav>

    <main class="demo-page demo-not-found" id="main-content">
      <section class="demo-section">
        <h1>Page not found</h1>
        <p>The demo page you requested does not exist.</p>
        <p><a href="./">Return to the ${escapeHtml(docs.name)} demo index</a>.</p>
      </section>
    </main>
  </body>
</html>
`;
}

function renderStyles() {
  return `:root {
  color-scheme: light;
  --demo-accent: #d9ff43;
  --demo-accent-strong: #173300;
  --demo-border: #a9ad9f;
  --demo-canvas: #f2f0e8;
  --demo-ink: #121510;
  --demo-muted: #50574c;
  --demo-panel: #fbfaf4;
  --demo-warn: #7a3800;
}

* {
  box-sizing: border-box;
}

body {
  background:
    linear-gradient(rgba(18, 21, 16, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 21, 16, 0.045) 1px, transparent 1px),
    var(--demo-canvas);
  background-size: 3rem 3rem;
  color: var(--demo-ink);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  margin: 0;
}

a {
  color: currentColor;
  text-decoration-color: #628000;
  text-decoration-thickness: 0.09em;
  text-underline-offset: 0.22em;
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid #466000;
  outline-offset: 3px;
}

.demo-skip {
  background: var(--demo-ink);
  color: #ffffff;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  padding: 0.5rem 0.75rem;
  position: absolute;
  transform: translateY(-150%);
  z-index: 1;
}

.demo-skip:focus {
  transform: translateY(0);
}

.demo-site-nav,
.demo-hero,
.demo-section-nav,
.demo-page,
.demo-footer {
  inline-size: min(76rem, calc(100vw - 2rem));
  margin-inline: auto;
  max-inline-size: calc(100vw - 2rem);
}

.demo-site-nav {
  align-items: center;
  border-block-end: 2px solid var(--demo-ink);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  justify-content: space-between;
  padding-block: 0.9rem;
}

.demo-site-nav__brand {
  font-weight: 900;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.demo-site-nav__links {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.demo-site-nav__links a {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-site-nav__links a[aria-current] {
  text-decoration-color: currentColor;
  text-decoration-thickness: 0.2em;
}

.demo-hero {
  align-items: end;
  display: grid;
  gap: clamp(1.5rem, 5vw, 4rem);
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.48fr);
  padding-block: clamp(3rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 2.5rem);
}

.demo-hero > * {
  min-inline-size: 0;
}

.demo-page {
  display: grid;
  gap: clamp(2.25rem, 6vw, 5rem);
  padding-block-end: clamp(3rem, 8vw, 7rem);
}

.demo-page > * {
  min-inline-size: 0;
}

.demo-eyebrow {
  color: var(--demo-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin-block: 0 1rem;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(3.5rem, 8vw, 7rem);
  letter-spacing: -0.065em;
  line-height: 0.88;
  margin-block: 0 1.5rem;
  max-inline-size: 8ch;
}

h2 {
  font-size: clamp(1.65rem, 3.5vw, 2.75rem);
  letter-spacing: -0.035em;
  line-height: 1.05;
  margin-block: 0 1.25rem;
}

h3 {
  font-size: 1rem;
  margin-block: 0 0.5rem;
}

p {
  margin-block: 0 0.75rem;
}

ul,
ol {
  margin-block: 0;
  padding-inline-start: 1.25rem;
}

code,
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.95em;
}

kbd {
  border: 1px solid var(--demo-border);
  border-radius: 0.25rem;
  padding: 0.05rem 0.3rem;
}

pre {
  background: #151914;
  border: 1px solid #333a30;
  border-radius: 0;
  color: #f5f5ec;
  margin: 0;
  max-inline-size: 100%;
  overflow-x: auto;
  padding: 1rem;
}

pre code {
  font-size: 0.875rem;
}

table {
  border-collapse: collapse;
  inline-size: 100%;
}

th,
td {
  border-block-end: 1px solid var(--demo-border);
  padding: 0.75rem;
  text-align: start;
  vertical-align: top;
}

th {
  font-weight: 700;
}

.demo-intro,
.demo-meta,
.demo-help {
  color: var(--demo-muted);
}

.demo-intro {
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  line-height: 1.45;
  max-inline-size: 38rem;
  overflow-wrap: anywhere;
}

.demo-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
  gap: 0.75rem;
  letter-spacing: 0.08em;
  margin-block-start: 2rem;
  text-transform: uppercase;
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block-start: 1.5rem;
}

.demo-section-nav {
  border-block: 2px solid var(--demo-ink);
  margin-block-end: clamp(2rem, 5vw, 4rem);
  padding-block: 0.7rem;
}

.demo-section-nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.demo-section-nav a,
.demo-card-label,
.demo-subheading {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-section-nav a {
  overflow-wrap: anywhere;
}

.demo-hero__signal {
  aspect-ratio: 1;
  background: var(--demo-ink);
  border-radius: 50%;
  color: var(--demo-canvas);
  display: grid;
  inline-size: min(100%, 24rem);
  justify-self: end;
  min-inline-size: 0;
  place-content: center;
  position: relative;
  transform: rotate(5deg);
}

.demo-hero__signal > span:first-child {
  font-size: clamp(4.5rem, 11vw, 9rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.8;
}

.demo-hero__token {
  background: var(--demo-accent);
  border: 2px solid var(--demo-ink);
  border-radius: 999px;
  color: var(--demo-ink);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.5rem 0.8rem;
  position: absolute;
  text-transform: uppercase;
}

.demo-hero__token:nth-child(2) {
  inset-block-start: 12%;
  inset-inline-end: 4%;
}

.demo-hero__token:nth-child(3) {
  inset-block-end: 10%;
  inset-inline-start: 4%;
}

.demo-section {
  border-block-start: 2px solid var(--demo-ink);
  padding-block-start: clamp(1.5rem, 4vw, 2.5rem);
}

.demo-section:first-child {
  border-block-start: 0;
  padding-block-start: 0;
}

.demo-grid {
  align-items: start;
  display: grid;
  gap: clamp(1rem, 3vw, 2.5rem);
  grid-template-columns: minmax(0, 1.15fr) minmax(16rem, 0.85fr);
  min-inline-size: 0;
}

.demo-card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
  min-inline-size: 0;
  padding: 0;
}

.demo-card,
.demo-feature-card,
.demo-note {
  background: var(--demo-panel);
  border: 1px solid var(--demo-ink);
  border-radius: 0;
  box-shadow: 0.4rem 0.4rem 0 var(--demo-ink);
  padding: clamp(1rem, 2vw, 1.5rem);
}

.demo-card {
  min-block-size: 11rem;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.demo-feature-card {
  margin-block: 1rem 1.5rem;
}

.demo-card-label,
.demo-subheading {
  color: var(--demo-muted);
  margin-block: 0 0.5rem;
}

.demo-card:hover {
  box-shadow: 0.6rem 0.6rem 0 var(--demo-accent-strong);
  transform: translate(-0.2rem, -0.2rem);
}

.demo-card h3,
.demo-feature-card h3 {
  margin-block-end: 0.35rem;
}

.demo-card,
.demo-feature-card,
.demo-grid > *,
.demo-card-grid > * {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.demo-form {
  display: grid;
  gap: 1rem;
  min-inline-size: 0;
}

.demo-button {
  background: var(--demo-ink);
  border: 2px solid var(--demo-ink);
  border-radius: 999px;
  color: var(--demo-canvas);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-weight: 700;
  justify-self: start;
  min-block-size: 3rem;
  padding-inline: 1.25rem;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  text-align: center;
  text-decoration: none;
}

.demo-button:hover {
  background: var(--demo-accent);
  color: var(--demo-ink);
  transform: translateY(-0.15rem);
}

.demo-button--secondary {
  background: transparent;
  color: var(--demo-ink);
}

.demo-button--secondary:hover {
  background: var(--demo-ink);
  color: var(--demo-canvas);
}

.demo-output {
  background: #f8ffd8;
  border: 1px solid #62720d;
  border-radius: 0;
  display: block;
  min-block-size: 2.75rem;
  min-inline-size: 0;
  overflow-wrap: anywhere;
  padding: 0.75rem;
}

.demo-table-wrap {
  max-inline-size: 100%;
  overflow-x: auto;
}

.demo-warning {
  border-inline-start: 0.25rem solid #f59e0b;
  color: var(--demo-warn);
  margin-block-start: 0.75rem;
  padding-inline-start: 0.75rem;
}

.demo-docs-link {
  margin-block-start: 1rem;
}

.demo-footer {
  --demo-footer-background: #121510;
  --demo-footer-color: #f2f0e8;
  --demo-footer-muted-color: #b9bdae;
  --demo-footer-link-color: #d9ff43;
  --demo-footer-border-color: #121510;
  --demo-footer-focus-color: #d9ff43;
  --demo-footer-radius: 0;
  --demo-footer-space: clamp(1.5rem, 4vw, 3rem);
  --_background: var(--demo-footer-background);
  --_color: var(--demo-footer-color);
  --_muted-color: var(--demo-footer-muted-color);
  --_link-color: var(--demo-footer-link-color);
  --_border-color: var(--demo-footer-border-color);
  --_focus-color: var(--demo-footer-focus-color);
  --_radius: var(--demo-footer-radius);
  --_space: var(--demo-footer-space);
  background: var(--_background);
  border: 1px solid var(--_border-color);
  border-radius: var(--_radius);
  color: var(--_color);
  margin-block-end: 1rem;
  padding: var(--_space);
}

.demo-footer__inner {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 3rem;
  justify-content: space-between;
}

.demo-footer__brand {
  display: grid;
  gap: 0.35rem;
}

.demo-footer__eyebrow,
.demo-footer__credit,
.demo-footer__meta {
  margin: 0;
}

.demo-footer__eyebrow,
.demo-footer__meta {
  color: var(--_muted-color);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-footer__plugin {
  font-weight: 800;
}

.demo-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.demo-footer__link {
  color: var(--_link-color);
}

.demo-footer__link:focus-visible {
  border-radius: 0.2rem;
  outline: 3px solid var(--_focus-color);
  outline-offset: 0.25rem;
}

.demo-footer__separator {
  margin-inline: 0.35rem;
}

.demo-not-found {
  padding-block: 2rem;
}

@media (max-width: 56rem) {
  .demo-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 64rem) {
  .demo-hero {
    grid-template-columns: 1fr;
  }

  .demo-hero__signal {
    inline-size: min(22rem, 80vw);
    justify-self: center;
  }
}

@media (max-width: 42rem) {
  .demo-site-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .demo-grid,
  .demo-card-grid {
    grid-template-columns: 1fr;
  }

  .demo-hero {
    grid-template-columns: 1fr;
    min-block-size: auto;
  }

  .demo-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .demo-button {
    max-inline-size: 100%;
    inline-size: 100%;
  }

  .demo-hero__signal {
    inline-size: min(18rem, 76vw);
    justify-self: center;
  }

  .demo-hero__token {
    font-size: 0.65rem;
    max-inline-size: 12rem;
  }

  .demo-footer__inner,
  .demo-footer__links {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (forced-colors: active) {
  .demo-card,
  .demo-note,
  .demo-button,
  .demo-output,
  pre {
    border: 1px solid CanvasText;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms;
    animation-iteration-count: 1;
    scroll-behavior: auto;
    transition-duration: 0.001ms;
  }
}
`;
}
