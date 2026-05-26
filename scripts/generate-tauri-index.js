import fs from "fs";
import path from "path";

const clientDir = path.join(process.cwd(), "dist", "client");
const assetsDir = path.join(clientDir, "assets");

function generate() {
  console.log("⚡ Starting static index.html generation for Tauri...");

  if (!fs.existsSync(assetsDir)) {
    console.error("❌ Assets directory not found. Did you run `npm run build` first?");
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir);
  
  // Find the primary index js bundle and global stylesheet
  const jsFile = files.find(f => f.startsWith("index-") && f.endsWith(".js"));
  const cssFile = files.find(f => f.startsWith("styles-") && f.endsWith(".css"));

  if (!jsFile || !cssFile) {
    console.error("❌ Critical client bundles (index-*.js or styles-*.css) were not found.");
    process.exit(1);
  }

  console.log(`✨ Found Client Script: assets/${jsFile}`);
  console.log(`✨ Found Client Styles: assets/${cssFile}`);

  // Create the static fallback index template.
  // Because TanStack Start hydrates directly onto the document, we provide a clean,
  // minimal html shell that the client-side router can mount over.
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>ShiftFlow Nurse</title>
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

  const outputPath = path.join(clientDir, "index.html");
  fs.writeFileSync(outputPath, htmlContent, "utf8");
  console.log(`🚀 Successfully generated static entry: dist/client/index.html`);
}

generate();
