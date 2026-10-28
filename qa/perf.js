// Timing + behaviour checks in headless Chrome against demo/demo.html.
//   node qa/perf.js <outDir>
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const OUT = path.resolve(process.argv[2] || "qa/out");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEMO = "file:///" + path.resolve(__dirname, "../demo/demo.html").replace(/\\/g, "/");

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch({ executablePath: CHROME, headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
    const log = [];
    page.on("console", m => log.push(m.type() + ": " + m.text()));
    page.on("pageerror", e => log.push("pageerror: " + e.message));
    const ready = async q => {
        await page.goto(DEMO + "?" + q);
        await page.waitForSelector("body[data-ready]", { timeout: 20000 });
    };
    const res = {};

    // 1,000 nodes: initial render with everything expanded
    await page.goto(DEMO + "?shot=1&data=big&style=PILL&levels=1");
    await page.waitForSelector("body[data-ready]");
    res.render1000 = await page.evaluate(async () => {
        const rows = HCP_MOCK.big(1000).rows;
        const t0 = performance.now();
        const c = hierarchyChartPro.init("orgChart", {
            dataProvider: () => Promise.resolve({ cols: HCP_MOCK.COLS, rows }), style: "PILL", initialLevels: 99, animate: false,
            roles: { id: "NODE_ID", parent: "PARENT_ID", title: "TITLE", subtitle: "SUBTITLE", color: "NODE_COLOR", legend: "LEGEND", highlight: "HIGHLIGHT" }
        });
        await new Promise(r => document.getElementById("orgChart").addEventListener("hierarchychartpro_after_render", r, { once: true }));
        return { ms: Math.round(performance.now() - t0), visible: c.V.length, dom: document.querySelectorAll(".hcp-node").length };
    });

    // 5,000 nodes: expand all
    await ready("shot=1&data=big&style=PILL");
    res.expandAll5000 = await page.evaluate(() => {
        const t0 = performance.now();
        chart.expandAll();
        return { ms: Math.round(performance.now() - t0), visible: chart.V.length, shownInDom: Array.from(document.querySelectorAll(".hcp-node")).filter(e => e.style.display !== "none").length };
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, "perf-5000-expanded.png") });

    // frame rate while expanding one branch on the 150-node org (animated)
    await page.goto(DEMO + "?data=org&style=AVATAR&levels=2");
    await page.waitForSelector("body[data-ready]");
    res.expandAnim = await page.evaluate(async () => {
        const frames = [];
        let run = true;
        const tick = t => { frames.push(t); if (run) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
        chart.expandAll();
        await new Promise(r => setTimeout(r, 700));
        run = false;
        const gaps = frames.slice(1).map((t, i) => t - frames[i]);
        // pure script cost of one animation frame (positions + every connector)
        const t1 = performance.now();
        for (let i = 0; i < 50; i++) {
            for (const n of chart.V) n.el.style.transform = `translate(${n.box.x + i}px,${n.box.y}px)`;
            chart._drawLinks();
        }
        const perFrame = (performance.now() - t1) / 50;
        return { nodes: chart.V.length, frames: frames.length, worstFrameMs: Math.round(Math.max(...gaps)), avgFrameMs: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length * 10) / 10, scriptPerFrameMs: Math.round(perFrame * 100) / 100 };
    });

    // search: type, count, next, focus path expands
    await ready("shot=1&data=org&style=DETAILED&levels=1");
    await page.fill(".hcp-q", "engineer");
    await page.waitForTimeout(500);
    res.search = await page.evaluate(() => ({ count: document.querySelector(".hcp-count").textContent, matchesVisible: document.querySelectorAll(".hcp-match").length, cur: !!document.querySelector(".hcp-cur") }));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, "search.png") });

    // keyboard: focus root, ArrowDown expands/moves, Space toggles
    await ready("shot=1&data=org&style=AVATAR&levels=1");
    await page.focus('.hcp-node[tabindex="0"]');
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(600);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    res.keyboard = await page.evaluate(() => ({ active: document.activeElement.getAttribute("aria-label"), level: document.activeElement.getAttribute("aria-level"), expanded: document.querySelectorAll('[aria-expanded="true"]').length }));

    // lazy: expand a node, then search a deep node (server path)
    await ready("shot=1&data=lazy&style=PILL");
    res.lazy = await page.evaluate(async () => {
        const before = chart.nodes.size;
        const n = chart.V.find(x => chart.hasKids(x) && !x.exp);
        await chart.expand(n.id);
        const afterExpand = chart.nodes.size;
        const target = HCP_MOCK.big(10000, 11).rows[9876][2];
        const hits = await chart.search(target);
        await new Promise(r => setTimeout(r, 1200));
        const first = hits[0];
        return { before, afterExpand, hits: hits.length, firstDepth: first && first.depth, firstVisible: !!(first && first.el && first.el.isConnected), nodesLoaded: chart.nodes.size };
    });

    // context menu + drill + export svg
    await ready("shot=1&data=org&style=CLASSIC&levels=2");
    const box = await page.locator(".hcp-node").nth(1).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + 10, { button: "right" });
    res.menu = await page.evaluate(() => Array.from(document.querySelectorAll(".hcp-menu button")).map(b => b.textContent));
    await page.keyboard.press("Escape");
    res.export = await page.evaluate(async () => {
        const { svg, W, H } = await chart._svgString();
        return { bytes: svg.length, W, H, foreign: (svg.match(/<foreignObject/g) || []).length };
    });
    const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => chart.exportImage("png", "org"))]);
    await dl.saveAs(path.join(OUT, "export.png"));

    fs.writeFileSync(path.join(OUT, "perf.json"), JSON.stringify({ res, log }, null, 2));
    console.log(JSON.stringify(res, null, 2));
    console.log(log.filter(l => !l.startsWith("warning")).join("\n"));
    await browser.close();
})();
