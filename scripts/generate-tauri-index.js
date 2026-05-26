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
  // TanStack Start's default client entry calls hydrateRoot(document, <StartClient/>).
  // StartClient internally calls hydrateStart() which reads window.$_TSR for dehydrated
  // router state. Without this data, hydrate() throws an invariant error and React never
  // mounts — producing the blank-screen bug.
  //
  // The fix: inject a minimal window.$_TSR seed that satisfies the hydration bootstrap.
  // We provide only the root route match ("__root__") with no lastMatchId, which causes
  // the router to detect "SPA mode" (lastMatchId !== last match id) and trigger a full
  // client-side router.load() — exactly the behavior we need for the static desktop shell.
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>ShiftFlow Nurse</title>
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <script>
      // TanStack Start SSR bootstrap seed for static desktop shell.
      // This provides the minimal dehydrated state so the client entry's
      // hydrateRoot() + StartClient hydration path succeeds and enters
      // SPA fallback mode (full client-side routing).
      window.$_TSR = {
        router: {
          manifest: undefined,
          dehydratedData: undefined,
          // Omit lastMatchId so the router detects SPA mode
          matches: [
            {
              i: "__root__",
              s: "success",
              u: Date.now(),
            },
          ],
        },
        h: function() {},
        e: function() {},
        c: function() {},
        p: function(s) { s(); },
        buffer: [],
      };
    </script>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

  const outputPath = path.join(clientDir, "index.html");
  fs.writeFileSync(outputPath, htmlContent, "utf8");
  console.log(`🚀 Successfully generated static entry: dist/client/index.html`);
}

generate();
