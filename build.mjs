// Builds dist/ from src/: one self-contained IIFE (d3 modules bundled, no CDN)
// exposing the global `hierarchyChartPro`, plus the stylesheet.
//   npm run build
import { build } from "esbuild";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
mkdirSync("dist", { recursive: true });

const common = {
    entryPoints: ["src/js/hierarchyChartPro.js"],
    bundle: true,
    format: "iife",
    globalName: "hierarchyChartPro",
    target: ["es2019", "chrome90", "firefox90", "safari14"],
    charset: "ascii",
    legalComments: "inline",
    banner: { js: `/* Hierarchy Pro ${pkg.version} - bundles d3-hierarchy, d3-zoom, d3-selection, d3-transition (ISC, (c) Mike Bostock) */` }
};

await build({ ...common, outfile: "dist/hierarchyChartPro.js", minify: false });
await build({ ...common, outfile: "dist/hierarchyChartPro.min.js", minify: true, legalComments: "eof" });

copyFileSync("src/css/hierarchyChartPro.css", "dist/hierarchyChartPro.css");
await build({ entryPoints: ["src/css/hierarchyChartPro.css"], outfile: "dist/hierarchyChartPro.min.css", minify: true, charset: "ascii", target: ["chrome100", "safari16"] });

for (const f of ["hierarchyChartPro.js", "hierarchyChartPro.min.js", "hierarchyChartPro.css", "hierarchyChartPro.min.css"]) {
    const s = readFileSync("dist/" + f);
    console.log(f.padEnd(28), (s.length / 1024).toFixed(1) + " KB");
}
writeFileSync("dist/VERSION", pkg.version + "\n");
