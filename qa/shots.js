// Screenshot sweep of demo/demo.html: every style x orientation, light/dark, LTR/RTL.
//   node qa/shots.js <outDir> [filter]          e.g. node qa/shots.js ./out AVATAR
// Writes one PNG per combination plus contact sheets (sheet-*.png) and errors.txt.
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const OUT = path.resolve(process.argv[2] || "qa/out");
const FILTER = process.argv[3] || "";
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEMO = "file:///" + path.resolve(__dirname, "../demo/demo.html").replace(/\\/g, "/");

const STYLES = ["AVATAR", "CLASSIC", "DETAILED", "PILL", "BUBBLE", "HEADER", "MINIMAL", "BADGE", "PHOTO", "CUSTOM"];
const ORIENTS = ["TB", "BT", "LR", "RL", "RADIAL"];

function combos() {
    const list = [];
    for (const s of STYLES) for (const o of ORIENTS) list.push({ style: s, orient: o });
    // close-ups at 100 % to judge the cards themselves
    for (const s of STYLES) list.push({ style: s, orient: "TB", view: "ROOT" });
    // theme / direction variants on the main orientations
    for (const s of STYLES) {
        list.push({ style: s, orient: "TB", theme: "dark" });
        list.push({ style: s, orient: "TB", dir: "rtl", data: "ar" });
        list.push({ style: s, orient: "LR", dir: "rtl", data: "ar", theme: "dark" });
    }
    list.push({ style: "AVATAR", orient: "TB", data: "cb" });
    list.push({ style: "PILL", orient: "TB", data: "big" });
    list.push({ style: "AVATAR", orient: "TB", data: "bad" });
    list.push({ style: "AVATAR", orient: "TB", data: "lazy" });
    list.push({ style: "DETAILED", orient: "TB", bands: "1", mini: "1" });
    list.push({ style: "AVATAR", orient: "TB", compact: "1", connector: "CURVED" });
    list.push({ style: "CLASSIC", orient: "TB", leaf: "ROW", connector: "ELBOW" });
    // leaf teams fully open: stacked pairs (4-8 leaves) and grid panels (9+)
    list.push({ style: "AVATAR", orient: "TB", levels: "4" });
    list.push({ style: "PILL", orient: "TB", levels: "4", view: "ROOT" });
    list.push({ style: "MINIMAL", orient: "BT", levels: "4" });
    list.push({ style: "HEADER", orient: "TB", levels: "4", dir: "rtl", data: "ar" });
    list.push({ style: "PILL", orient: "LR", levels: "4" });
    // statuses: highlighted only, the customization panel
    list.push({ style: "BADGE", orient: "TB", only: "1" });
    list.push({ style: "PHOTO", orient: "TB", only: "1", dir: "rtl", data: "ar" });
    list.push({ style: "AVATAR", orient: "TB", cfg: "1" });
    list.push({ style: "BADGE", orient: "LR", cfg: "1", theme: "dark" });
    return list.filter(c => !FILTER || new RegExp(FILTER).test(name(c)));
}

// eslint-disable-next-line no-var
var name =c => Object.entries(c).map(([k, v]) => (k === "style" || k === "orient" ? v : k + "-" + v)).join("_");

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch({ executablePath: CHROME, headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${page.url().split("?")[1]}] ${m.type()}: ${m.text()}`); });
    page.on("pageerror", e => errors.push(`[${page.url().split("?")[1]}] pageerror: ${e.message}`));
    const files = [];
    for (const c of combos()) {
        const q = new URLSearchParams(Object.assign({ shot: "1" }, c)).toString();
        await page.goto(DEMO + "?" + q);
        await page.waitForSelector("body[data-ready]", { timeout: 15000 }).catch(() => errors.push("[" + q + "] never became ready"));
        await page.waitForTimeout(250);
        const f = path.join(OUT, name(c) + ".png");
        await page.screenshot({ path: f });
        files.push(f);
    }
    // contact sheets, 12 per sheet
    for (let i = 0; i < files.length; i += 12) {
        const imgs = files.slice(i, i + 12).map(f =>
            `<figure><img src="file:///${f.replace(/\\/g, "/")}"><figcaption>${path.basename(f, ".png")}</figcaption></figure>`).join("");
        await page.setViewportSize({ width: 1920, height: 1100 });
        await page.setContent(`<style>body{margin:0;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:#888;font:12px sans-serif}figure{margin:0;background:#fff}img{width:100%;display:block}figcaption{padding:2px 4px}</style>${imgs}`);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(OUT, `sheet-${String(i / 12 + 1).padStart(2, "0")}.png`), fullPage: true });
        await page.setViewportSize({ width: 1280, height: 820 });
    }
    fs.writeFileSync(path.join(OUT, "errors.txt"), errors.join("\n"));
    console.log(files.length + " shots, " + errors.length + " console messages -> " + OUT);
    await browser.close();
})();
