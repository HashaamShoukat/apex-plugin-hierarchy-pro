// Builds dist/ from src/: one self-contained IIFE (d3 modules bundled, no CDN)
// exposing the global `hierarchyChartPro`, plus the stylesheet, plain and minified.
// The version comes from package.json and is written into the package spec
// (c_version), apexplugin.json, the README badge and plugin/plugin.template.apx ->
// dist/plugin.apx (file URLs carry a content hash, so browsers never keep an old copy).
// With APEX_APP_DIR set to an APEXlang application folder, the static files and
// plugin.apx are also written into it (shared-components/plugins/region/hierarchyChartPro).
//   npm install && npm run build
import { build } from "esbuild";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const VERSION = pkg.version;
const APP = process.env.APEX_APP_DIR
    ? process.env.APEX_APP_DIR.replace(/[\\/]+$/, "") + "/shared-components/plugins/region/hierarchyChartPro"
    : null;
const read = f => readFileSync(f, "utf8").replace(/\r\n/g, "\n");
mkdirSync("dist", { recursive: true });

const common = {
    entryPoints: ["src/js/hierarchyChartPro.js"],
    bundle: true,
    format: "iife",
    globalName: "hierarchyChartPro",
    target: ["es2019", "chrome90", "firefox90", "safari14"],
    charset: "ascii",
    legalComments: "inline",
    banner: { js: `/* Hierarchy Pro ${VERSION} - bundles d3-hierarchy, d3-zoom, d3-selection, d3-transition (ISC, (c) Mike Bostock) */` }
};

await build({ ...common, outfile: "dist/hierarchyChartPro.js", minify: false });
await build({ ...common, outfile: "dist/hierarchyChartPro.min.js", minify: true, legalComments: "eof" });

copyFileSync("src/css/hierarchyChartPro.css", "dist/hierarchyChartPro.css");
await build({ entryPoints: ["src/css/hierarchyChartPro.css"], outfile: "dist/hierarchyChartPro.min.css", minify: true, charset: "ascii", target: ["chrome111", "firefox113", "safari16.2"] });

const files = { js: ["hierarchyChartPro.js", "hierarchyChartPro.min.js"], css: ["hierarchyChartPro.css", "hierarchyChartPro.min.css"] };
for (const [dir, list] of Object.entries(files)) {
    if (APP) { mkdirSync(`${APP}/static-files/${dir}`, { recursive: true }); }
    for (const f of list) {
        const s = readFileSync("dist/" + f);
        if (APP) { writeFileSync(`${APP}/static-files/${dir}/${f}`, s); }
        console.log(f.padEnd(28), (s.length / 1024).toFixed(1) + " KB");
    }
}

// plugin.apx with a content hash in the file URLs
const hash = createHash("sha256").update(readFileSync("dist/hierarchyChartPro.min.js"))
    .update(readFileSync("dist/hierarchyChartPro.min.css")).digest("hex").slice(0, 8);
const apx = read("plugin/plugin.template.apx")
    .replaceAll("?v=@@VERSION@@", `?v=${VERSION}-${hash}`)
    .replaceAll("@@VERSION@@", VERSION);
writeFileSync("dist/plugin.apx", apx);
if (APP) { writeFileSync(`${APP}/plugin.apx`, apx); }

// the version everywhere else it is shown
writeFileSync("db/hierarchy_chart_plugin_pkg.pks", read("db/hierarchy_chart_plugin_pkg.pks")
    .replace(/(c_version\s+constant\s+varchar2\(10\)\s*:=\s*)'[^']*'/, `$1'${VERSION}'`));
writeFileSync("apexplugin.json", read("apexplugin.json").replace(/("version"\s*:\s*)"[^"]*"/, `$1"${VERSION}"`));
writeFileSync("README.md", read("README.md").replace(/(img\.shields\.io\/badge\/version-)[0-9.]+/, `$1${VERSION}`));
writeFileSync("dist/VERSION", VERSION + "\n");
console.log("plugin.apx".padEnd(28), `?v=${VERSION}-${hash}`);
