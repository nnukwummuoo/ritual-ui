/**
 * Auto-bumps the service worker's CACHE_VERSION on every build.
 *
 * public/worker.js is compiled into public/sw.js by next-pwa at build time
 * (see next.config.ts -> swSrc: 'public/worker.js'). Runtime-cached buckets
 * (JS/CSS/images) are keyed off CACHE_VERSION, so bumping it on every build
 * guarantees each deploy gets a clean cache instead of users potentially
 * running a mix of old cached chunks + new HTML until the 24h expiry window
 * clears naturally.
 *
 * Runs automatically before `build` via the "prebuild" script in package.json
 * (npm/pnpm/yarn all auto-run "pre<script>" before "<script>").
 */

const fs = require("fs");
const path = require("path");

const WORKER_PATH = path.join(__dirname, "..", "public", "worker.js");

function main() {
  const source = fs.readFileSync(WORKER_PATH, "utf8");

  // Unique + monotonically increasing per build, no external deps needed.
  const newVersion = `v${Date.now()}`;

  const versionLineRegex = /const CACHE_VERSION = ['"].*?['"];/;

  if (!versionLineRegex.test(source)) {
    console.error(
      `[update-sw-version] Could not find "const CACHE_VERSION = '...';" in ${WORKER_PATH}. ` +
        "Skipping — check that the file wasn't restructured."
    );
    process.exit(1);
  }

  const updated = source.replace(
    versionLineRegex,
    `const CACHE_VERSION = '${newVersion}';`
  );

  fs.writeFileSync(WORKER_PATH, updated, "utf8");
  console.log(`[update-sw-version] CACHE_VERSION -> ${newVersion}`);
}

main();