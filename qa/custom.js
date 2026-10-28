// Interactive checks on demo/demo.html: customization panel (saved in the browser and
// restored on reload), reset, status legend filter, "highlighted only", multi-node highlight.
//   node qa/custom.js <outDir>
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
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const ok = (name, cond, info) => console.log((cond ? "PASS " : "FAIL ") + name + (info !== undefined ? " -> " + JSON.stringify(info) : ""));
    const ready = async q => {
        await page.goto(DEMO + "?" + q);
        await page.waitForSelector("body[data-ready]");
        await page.waitForTimeout(300);
    };

    await ready("customize=BROWSER");
    await page.evaluate(() => localStorage.removeItem("hcp-prefs:demo"));
    await ready("customize=BROWSER");

    // open the panel, pick Badge card, Left to right, curved, wider cards, no shadow, teal accent
    await page.click('[data-act="customize"]');
    ok("more settings start closed", await page.$eval(".hcp-more", d => !d.open));
    await page.click(".hcp-more > summary");
    await page.click('.hcp-stys [data-v="BADGE"]');
    await page.click('[data-k="orientation"] [data-v="LR"]');
    await page.click('[data-k="connector"] [data-v="CURVED"]');
    await page.$eval('input[data-k="nodeWidth"]', i => { i.value = 280; i.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.click('label.hcp-tog:has(input[data-k="shadow"])');
    await page.click('[data-k="accent"] [data-v="#0d9488"]');
    await page.waitForTimeout(900);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hcp-prefs:demo")));
    ok("prefs saved", saved && saved.style === "BADGE" && saved.orientation === "LR" && saved.connector === "CURVED" && saved.nodeWidth === 280 && saved.shadow === false && saved.accent === "#0d9488", saved);
    ok("saved note shown", await page.$eval(".hcp-cfg-ok", e => e.textContent.length > 0));
    await page.screenshot({ path: path.join(OUT, "custom-1-changed.png") });

    // reload: the user's look comes back
    await ready("customize=BROWSER");
    const after = await page.evaluate(() => ({
        style: window.chart.style, orient: window.chart.orient, w: window.chart.nodeW,
        cls: document.querySelector(".hcp").className, accent: document.querySelector(".hcp").style.getPropertyValue("--hcp-primary")
    }));
    ok("restored after reload", after.style === "BADGE" && after.orient === "LR" && after.w === 280 && /hcp--noshadow/.test(after.cls) && after.accent === "#0d9488", after);

    // reset to the developer's settings
    await page.click('[data-act="customize"]');
    await page.click('[data-c="reset"]');
    await page.waitForTimeout(900);
    const reset = await page.evaluate(() => ({ style: window.chart.style, orient: window.chart.orient, ls: localStorage.getItem("hcp-prefs:demo") }));
    ok("reset", reset.style === "AVATAR" && reset.orient === "TB" && reset.ls === null, reset);
    await page.keyboard.press("Escape");
    ok("panel closed with Esc", !(await page.$(".hcp-cfg")));

    // status legend: pick out "Absent"
    await page.click('.hcp-lg-st[data-st="Absent"]');
    await page.waitForTimeout(300);
    const dim = await page.evaluate(() => ({
        dim: document.querySelector(".hcp").classList.contains("hcp-dim"),
        on: Array.from(document.querySelectorAll(".hcp-node.hcp-on")).map(e => e.getAttribute("title"))
    }));
    ok("status filter dims others", dim.dim && dim.on.length > 0 && dim.on.every(t => / · Absent$/.test(t)), dim.on);

    // highlighted only, restricted to Absent
    await page.click('[data-act="onlyHl"]');
    await page.waitForTimeout(600);
    const only = await page.evaluate(() => {
        const c = window.chart;
        const leaves = c.V.filter(n => !n.shown.length);
        return { visible: c.V.length, leavesAbsent: leaves.every(n => c._flag(n) && c._flag(n).label === "Absent"), count: c.statusMap.get("Absent").count };
    });
    ok("highlighted only = Absent people and their managers", only.leavesAbsent && only.visible > only.count, only);
    await page.screenshot({ path: path.join(OUT, "custom-2-absent-only.png") });
    await page.click('[data-act="onlyHl"]');
    await page.click('.hcp-lg-st[data-st="Absent"]');

    // several ids from the API (as a page item would send "1003:1050:1100")
    await page.evaluate(() => window.chart.highlight("1003:1050:1100", true));
    await page.waitForTimeout(900);
    const hl = await page.evaluate(() => Array.from(document.querySelectorAll(".hcp-node.hcp-hl")).map(e => e.getAttribute("data-id")).sort());
    ok("multi highlight", hl.join() === "1003,1050,1100", hl);
    await page.screenshot({ path: path.join(OUT, "custom-3-multi.png") });

    // collapsed branches carry a count of highlighted people
    const counts = await page.evaluate(() => Array.from(document.querySelectorAll(".hcp-tgh")).length);
    ok("branch counters", counts > 0, counts);

    // 2.0: toolbar switches, card content, body fields, allowed views
    await ready("customize=BROWSER&style=DETAILED");
    await page.evaluate(() => localStorage.removeItem("hcp-prefs:demo"));
    await ready("customize=BROWSER&style=DETAILED");
    const det0 = await page.evaluate(() => ({ fl: document.querySelectorAll(".hcp-fl").length, detailsOn: document.querySelector('[data-act="details"]').getAttribute("aria-pressed") }));
    await page.click('[data-act="details"]');
    await page.waitForTimeout(300);
    const det1 = await page.evaluate(() => ({ fl: document.querySelectorAll(".hcp-fl").length, detailsOn: document.querySelector('[data-act="details"]').getAttribute("aria-pressed") }));
    ok("details switch hides the body", det0.fl > 0 && det1.fl === 0 && det0.detailsOn === "true" && det1.detailsOn === "false", [det0, det1]);
    await page.click('[data-act="details"]');
    await page.click('[data-act="compact"]');
    await page.waitForTimeout(300);
    ok("compact switch", await page.evaluate(() => document.querySelector(".hcp").classList.contains("hcp--compact") && document.querySelector('[data-act="compact"]').classList.contains("is-on")));
    await page.click('[data-act="compact"]');
    await page.click('[data-act="photos"]');
    await page.waitForTimeout(300);
    ok("photos switch -> initials only", await page.evaluate(() => document.querySelectorAll(".hcp-av img").length === 0));
    await page.click('[data-act="photos"]');
    // card content in the panel: subtitle off, one body field off, footer off
    const foot0 = await page.evaluate(() => document.querySelectorAll(".hcp-node .hcp-foot").length);
    // the footer is a section of its own, below the totals - not inside them
    const fsec = await page.evaluate(() => {
        const f = document.querySelector(".hcp-node .hcp-foot");
        return { inMeta: !!f.closest(".hcp-meta"), afterMeta: !!(f.previousElementSibling && f.previousElementSibling.matches(".hcp-meta")), border: getComputedStyle(f).borderTopStyle };
    });
    ok("footer is its own section below the totals", !fsec.inMeta && fsec.afterMeta && fsec.border === "solid", fsec);
    ok("no Custom Template -> Custom view not offered", await page.evaluate(() => !window.chart.views.includes("CUSTOM")));
    await page.click('[data-act="customize"]');
    await page.click('label.hcp-tog:has(input[data-k="showSubtitle"])');
    await page.click('label.hcp-tog:has(input[data-f="GRADE"])');
    await page.click('label.hcp-tog:has(input[data-k="showFooter"])');
    await page.waitForTimeout(900);
    const cc = await page.evaluate(() => ({
        st: document.querySelectorAll(".hcp-node .hcp-st").length,
        foot: document.querySelectorAll(".hcp-node .hcp-foot").length,
        labels: Array.from(document.querySelector(".hcp-node .hcp-fl").querySelectorAll("dt")).map(d => d.textContent),
        prefs: JSON.parse(localStorage.getItem("hcp-prefs:demo"))
    }));
    ok("card content: subtitle off, Grade hidden, footer off", foot0 > 0 && cc.st === 0 && cc.foot === 0 && !cc.labels.includes("Grade") && cc.labels.length === 3 && cc.prefs.hiddenFields.join() === "GRADE", cc);
    ok("no highlight dot", await page.evaluate(() => getComputedStyle(document.querySelector(".hcp-flag .hcp-card"), "::before").content === "none"));
    // on a view without a body the body controls are disabled
    await page.click('.hcp-stys [data-v="PILL"]');
    await page.waitForTimeout(400);
    const pill = await page.evaluate(() => ({
        bodyDisabled: document.querySelector('input[data-k="showBody"]').disabled,
        subDisabled: document.querySelector('input[data-k="showSubtitle"]').disabled,
        totalsEnabled: !document.querySelector('input[data-k="showTotals"]').disabled,
        detailsBtn: document.querySelector('[data-act="details"]').disabled,
        team: document.querySelectorAll(".hcp-s-pill .hcp-meta--in .hcp-team").length
    }));
    ok("pill: body/subtitle disabled, totals shown", pill.bodyDisabled && pill.subDisabled && pill.totalsEnabled && pill.detailsBtn && pill.team > 0, pill);
    await page.click('[data-c="reset"]');
    await page.waitForTimeout(700);
    await page.keyboard.press("Escape");
    // only the allowed views are offered
    await ready("views=AVATAR,PILL&style=AVATAR");
    await page.click('[data-act="menuStyle"]');
    const menu = await page.evaluate(() => Array.from(document.querySelectorAll(".hcp-menu button")).map(b => b.textContent));
    ok("allowed views only", menu.length === 2, menu);
    await page.keyboard.press("Escape");
    ok("setStyle refuses other views", await page.evaluate(() => { window.chart.setStyle("BUBBLE"); return window.chart.style === "AVATAR"; }));
    // every view shows the team total and the branch highlight counter
    const views = ["AVATAR", "CLASSIC", "DETAILED", "PILL", "BUBBLE", "HEADER", "MINIMAL", "BADGE", "PHOTO"];
    const tot = {};
    for (const v of views) {
        await ready("style=" + v);
        tot[v] = await page.evaluate(() => ({ team: document.querySelectorAll(".hcp-team").length > 0, roll: document.querySelectorAll(".hcp-roll").length > 0, counter: document.querySelectorAll(".hcp-tgh").length > 0 }));
    }
    ok("totals + roll-up + counters on every view", Object.values(tot).every(x => x.team && x.roll && x.counter), tot);
    // no columns chosen -> a clear message, no guessing
    await page.evaluate(() => {
        hierarchyChartPro.init("orgChart", { dataProvider: () => Promise.resolve(HCP_MOCK.org("en")), roles: { id: "NODE_ID" } });
    });
    await page.waitForTimeout(500);
    const msg = await page.evaluate(() => document.querySelector(".hcp-msg:not([hidden])") && document.querySelector(".hcp-msg").textContent);
    ok("missing columns message", /Node ID, Title and Parent ID/.test(msg || ""), msg);

    ok("no page errors", errors.filter(e => !/Choose the Node ID/.test(e)).length === 0, errors);
    await browser.close();
})();
