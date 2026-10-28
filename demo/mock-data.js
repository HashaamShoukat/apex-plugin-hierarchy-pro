/* Mock data for demo.html - the same {cols, rows} shape the PL/SQL AJAX callback returns. */
(function () {
    "use strict";

    function rng(seed) {
        return function () {
            seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const EN_FIRST = ["James", "Sara", "Omar", "Aisha", "Daniel", "Fatima", "Michael", "Layla", "Ahmed", "Emily", "Yusuf", "Noura", "David", "Mariam", "Khalid", "Hannah", "Faisal", "Sofia", "Tariq", "Grace", "Hamza", "Olivia", "Zain", "Lina", "Ryan", "Huda", "Adam", "Rania", "Bilal", "Chloe", "Saad", "Maya", "Imran", "Amal", "Kevin", "Dana"];
    const EN_LAST = ["Al-Harbi", "Johnson", "Khan", "Al-Qahtani", "Smith", "Rahman", "Nguyen", "Al-Otaibi", "Fernandes", "Hassan", "Patel", "Al-Ghamdi", "Brown", "Siddiqui", "Martin", "Al-Shehri", "Wilson", "Aziz", "Lopez", "Al-Dossary", "Thomas", "Mirza", "Clarke", "Al-Zahrani"];
    const AR_FIRST = ["محمد", "سارة", "عمر", "عائشة", "خالد", "فاطمة", "أحمد", "ليلى", "يوسف", "نورة", "فيصل", "مريم", "طارق", "هدى", "حمزة", "رانيا", "سعد", "أمل", "بلال", "لينا"];
    const AR_LAST = ["الحربي", "القحطاني", "العتيبي", "الغامدي", "الشهري", "الدوسري", "الزهراني", "السبيعي", "المطيري", "العنزي"];

    const DEPTS = [
        { en: "Finance", ar: "المالية", c: "#2563eb", jobs: ["Chief Financial Officer", "Finance Manager", "Accountant"], ar_jobs: ["المدير المالي", "مدير الحسابات", "محاسب"] },
        { en: "Operations", ar: "العمليات", c: "#16a34a", jobs: ["VP Operations", "Site Manager", "Supervisor"], ar_jobs: ["نائب الرئيس للعمليات", "مدير موقع", "مشرف"] },
        { en: "Human Resources", ar: "الموارد البشرية", c: "#db2777", jobs: ["HR Director", "HR Business Partner", "HR Officer"], ar_jobs: ["مدير الموارد البشرية", "شريك أعمال", "أخصائي موارد"] },
        { en: "Information Technology", ar: "تقنية المعلومات", c: "#7c3aed", jobs: ["Chief Information Officer", "Engineering Manager", "Software Engineer"], ar_jobs: ["مدير تقنية المعلومات", "مدير هندسة", "مهندس برمجيات"] },
        { en: "Projects", ar: "المشاريع", c: "#d97706", jobs: ["Projects Director", "Project Manager", "Site Engineer"], ar_jobs: ["مدير المشاريع", "مدير مشروع", "مهندس موقع"] },
        { en: "Procurement", ar: "المشتريات", c: "#0891b2", jobs: ["Procurement Head", "Category Manager", "Buyer"], ar_jobs: ["رئيس المشتريات", "مدير فئة", "مشتري"] }
    ];
    const LOCS = ["Riyadh", "Jeddah", "Dammam", "Jubail", "NEOM"];
    const AR_LOCS = ["الرياض", "جدة", "الدمام", "الجبيل", "نيوم"];

    function avatar(seed) {
        const h = (seed * 47) % 360;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},60%,72%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},55%,52%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="25" r="11" fill="rgba(255,255,255,.9)"/><path d="M12 60c2-12 10-19 20-19s18 7 20 19z" fill="rgba(255,255,255,.9)"/></svg>`;
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }

    const COLS = ["NODE_ID", "PARENT_ID", "TITLE", "SUBTITLE", "IMAGE_URL", "NODE_COLOR", "LEGEND", "LINK", "HIGHLIGHT", "BADGE", "TOOLTIP", "LOCATION", "GRADE", "JOINED", "EMAIL", "EXT", "SALARY", "STATUS_COLOR"];
    // the colour of each status, as a Status Color Column would return it
    const STATUS_COLOR = { Vacant: "grey", Absent: "red", "On Leave": "amber", Remote: "teal", "شاغر": "grey", "غائب": "red", "في إجازة": "amber", "عن بعد": "teal" };

    // ~150 people: CEO -> 6 department heads -> managers -> staff
    function org(lang) {
        const r = rng(42);
        const ar = lang === "ar";
        const pick = a => a[Math.floor(r() * a.length)];
        const name = () => (ar ? pick(AR_FIRST) + " " + pick(AR_LAST) : pick(EN_FIRST) + " " + pick(EN_LAST));
        const rows = [];
        let id = 1000;
        // attendance status for the HIGHLIGHT column (by id, so it does not use up random numbers)
        const status = (nid, vacant) => {
            const k = vacant ? 0 : nid % 17 === 0 ? 1 : nid % 23 === 0 ? 2 : nid % 13 === 0 ? 3 : -1;
            if (k < 0) return null;
            return (ar ? ["شاغر", "غائب", "في إجازة", "عن بعد"] : ["Vacant", "Absent", "On Leave", "Remote"])[k];
        };
        const row = (pid, title, sub, d, grade, vacant) => {
            const nid = ++id;
            const loc = Math.floor(r() * LOCS.length);
            rows.push([
                String(nid), pid ? String(pid) : null,
                vacant ? (ar ? "وظيفة شاغرة" : "Vacant position") : title, sub,
                vacant || r() < 0.45 ? null : avatar(nid), d ? d.c : "#0f766e", d ? (ar ? d.ar : d.en) : (ar ? "الإدارة" : "Executive"),
                "#employee-" + nid, status(nid, vacant), "G" + grade + (nid % 9 === 0 ? (ar ? "; متعاقد" : "; Contractor") : ""),
                vacant ? (ar ? "قيد التوظيف" : "Recruitment in progress") : null,
                ar ? AR_LOCS[loc] : LOCS[loc], "Grade " + grade,
                new Date(2008 + Math.floor(r() * 17), Math.floor(r() * 12), 1 + Math.floor(r() * 27)).toISOString().slice(0, 10),
                vacant ? null : "user" + nid + "@example.com", String(2000 + Math.floor(r() * 7999)),
                String(Math.round((4000 + r() * 30000) / 50) * 50)
            ]);
            const last = rows[rows.length - 1];
            last.push(STATUS_COLOR[last[8]] || null);
            return nid;
        };
        // both languages draw the same random numbers, so the trees are identical
        const arCeo = pick(AR_FIRST) + " " + pick(AR_LAST);
        const ceo = row(null, ar ? arCeo : "Nadia Rahman", ar ? "الرئيس التنفيذي" : "Chief Executive Officer", null, 20, false);
        let count = 1;
        DEPTS.forEach((d, di) => {
            const head = row(ceo, name(), ar ? d.ar_jobs[0] : d.jobs[0], d, 18, false);
            count++;
            const mgrs = 2 + (di % 3);
            for (let m = 0; m < mgrs; m++) {
                const vac = di === 2 && m === 1;
                const mg = row(head, name(), ar ? d.ar_jobs[1] : d.jobs[1], d, 14, vac);
                count++;
                const staff = di === 4 && m === 0 ? 14 : 4 + Math.floor(r() * 7);
                for (let s = 0; s < staff && count < 152; s++) {
                    row(mg, name(), ar ? d.ar_jobs[2] : d.jobs[2], d, 8 + Math.floor(r() * 4), r() < 0.05);
                    count++;
                }
            }
        });
        return { cols: COLS.slice(), rows };
    }

    // random large tree
    function big(n, seed) {
        const r = rng(seed || 7);
        const rows = [];
        for (let i = 0; i < n; i++) {
            const id = "N" + i;
            let pid = null;
            if (i > 0) {
                // breadth-first fill, 3-8 children per node: a ragged but realistic tree
                const b = 3 + Math.floor(r() * 6);
                pid = "N" + Math.min(i - 1, Math.floor((i - 1) / b));
            }
            const d = DEPTS[i % DEPTS.length];
            rows.push([id, pid, EN_FIRST[i % EN_FIRST.length] + " " + EN_LAST[(i * 7) % EN_LAST.length], d.jobs[i % 3], null, d.c, d.en, null, r() < 0.01 ? "Y" : null, null, null,
                LOCS[i % LOCS.length], "Grade " + (8 + (i % 10)), null, null, null, String(5000 + (i % 40) * 500)]);
        }
        return { cols: COLS.slice(), rows };
    }

    // CONNECT BY style: rows in hierarchical order with LEVEL, no parent column
    function connectBy() {
        const o = org("en");
        const byP = new Map();
        o.rows.forEach(r => { const k = r[1] || ""; if (!byP.has(k)) byP.set(k, []); byP.get(k).push(r); });
        const out = [];
        const walk = (pid, lvl) => (byP.get(pid) || []).forEach(r => { out.push([lvl, r[0], r[2], r[3], r[5], r[6]]); walk(r[0], lvl + 1); });
        walk("", 1);
        return { cols: ["LEVEL", "NODE_ID", "TITLE", "SUBTITLE", "NODE_COLOR", "LEGEND"], rows: out };
    }

    // broken data: a cycle, an orphan, a duplicate and a self-parent
    function bad() {
        const o = org("en");
        const rows = o.rows.slice(0, 40);
        rows.push(["X1", "X3", "Cycle A", "points at C", null, "#dc2626", "Broken", null, null, null, null]);
        rows.push(["X2", "X1", "Cycle B", "points at A", null, "#dc2626", "Broken", null, null, null, null]);
        rows.push(["X3", "X2", "Cycle C", "points at B", null, "#dc2626", "Broken", null, null, null, null]);
        rows.push(["X4", "NOPE", "Orphan", "parent missing", null, "#dc2626", "Broken", null, null, null, null]);
        rows.push(["X5", "X5", "Self parent", "points at itself", null, "#dc2626", "Broken", null, null, null, null]);
        rows.push([rows[3][0], rows[3][1], "Duplicate id", "ignored", null, null, null]);
        return { cols: o.cols, rows };
    }

    // emulates the plug-in's lazy-loading AJAX protocol over an in-memory table
    function lazyProvider(all, levels) {
        const cols = all.cols;
        const byId = new Map(), byP = new Map();
        all.rows.forEach(r => {
            byId.set(r[0], r);
            const k = r[1] === null ? "" : r[1];
            if (!byP.has(k)) byP.set(k, []);
            byP.get(k).push(r);
        });
        const counts = rows => {
            const c = {};
            rows.forEach(r => (c[r[0]] = (byP.get(r[0]) || []).length));
            return c;
        };
        const delay = v => new Promise(res => setTimeout(() => res(v), 180));
        return function (req) {
            if (req.x01 === "DATA") {
                let lvl = byP.get("") || [];
                const out = lvl.slice();
                for (let i = 1; i < (levels || 2); i++) {
                    lvl = [].concat(...lvl.map(r => byP.get(r[0]) || []));
                    out.push(...lvl);
                }
                return delay({ cols, rows: out, counts: counts(out) });
            }
            if (req.x01 === "CHILDREN") {
                const rows = [].concat(...req.f01.map(id => byP.get(id) || []));
                return delay({ cols, rows, counts: counts(rows) });
            }
            const chain = ids => {
                const out = [], seen = new Set();
                ids.forEach(id => {
                    const c = [];
                    for (let r = byId.get(id); r && !seen.has(r[0]); r = byId.get(r[1])) { seen.add(r[0]); c.unshift(r); }
                    out.push(...c);
                });
                return out;
            };
            if (req.x01 === "PATH") {
                const rows = chain(req.f01);
                return delay({ cols, rows, counts: counts(rows) });
            }
            if (req.x01 === "SEARCH") {
                const t = String(req.x02 || "").toLowerCase();
                const hits = all.rows.filter(r => (r[2] + " " + r[3]).toLowerCase().includes(t)).slice(0, 50).map(r => r[0]);
                const rows = chain(hits);
                return delay({ cols, rows, counts: counts(rows), ids: hits });
            }
            return delay({ error: "unknown request" });
        };
    }

    window.HCP_MOCK = { org, big, connectBy, bad, lazyProvider, COLS };
})();
