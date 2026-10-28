/*!
 * Hierarchy Pro - Oracle APEX region plug-in
 * Renders any parent/child (or CONNECT BY ... LEVEL) SQL result as an
 * interactive hierarchy: org charts, cost centres, BOMs, account trees.
 *
 * Built on d3-hierarchy (radial layout), d3-zoom, d3-selection and
 * d3-transition. The linear layout is our own contour-based tidy tree so
 * nodes can have different heights and leaf teams can be stacked or gridded.
 *
 * Public entry point (bundled as the global `hierarchyChartPro`):
 *   hierarchyChartPro.init(regionId, options, initFunction)
 * The region is registered with apex.region.create, so
 *   apex.region("orgChart").expandAll()   etc. work (see README).
 */
import { hierarchy as d3hierarchy, tree as d3tree } from "d3-hierarchy";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import "d3-transition";

export const version = "2.1.0";

const EV = "hierarchychartpro_";
const instances = new Map();

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

const STYLES = ["AVATAR", "CLASSIC", "DETAILED", "PILL", "BUBBLE", "HEADER", "MINIMAL", "BADGE", "PHOTO", "CUSTOM"];
const ORIENTS = ["TB", "BT", "LR", "RL", "RADIAL"];
const CONNECTORS = ["ROUNDED", "ELBOW", "CURVED", "STRAIGHT"];
const LEAFS = ["AUTO", "ROW", "STACK", "GRID"];
const STYLE_WIDTH = { AVATAR: 210, CLASSIC: 200, DETAILED: 260, PILL: 236, BUBBLE: 150, HEADER: 240, MINIMAL: 220, BADGE: 240, PHOTO: 190, CUSTOM: 220 };
const MORE_WIDTH = 150;

// What each view can show besides the title, the team / roll-up totals and the highlight
// (ring, branch counter), which every view shows. "photo" = photo, icon or initials;
// "body" = Body Columns 1-4 as label / value rows; "footer" = the Footer Column.
const SLOTS = {
    AVATAR: ["photo", "subtitle", "badge", "status", "footer"],
    CLASSIC: ["icon", "subtitle", "badge", "status", "footer"],
    DETAILED: ["photo", "subtitle", "badge", "status", "body", "footer"],
    PILL: ["photo", "badge"],
    BUBBLE: ["photo", "subtitle", "badge", "status", "footer"],
    HEADER: ["photo", "subtitle", "badge", "status", "body", "footer"],
    MINIMAL: ["photo", "subtitle", "badge", "status", "footer"],
    BADGE: ["photo", "subtitle", "badge", "status", "footer"],
    PHOTO: ["photo", "subtitle", "badge", "status", "footer"],
    CUSTOM: ["photo", "subtitle", "badge", "status", "body", "footer"]
};
// card content switches: option name -> slot
const CONTENT = { showSubtitle: "subtitle", showBadge: "badge", showStatus: "status", showBody: "body", showFooter: "footer", showTotals: "totals" };

// colour names a Highlight Color Column may return (besides any CSS colour)
const NAMED = {
    red: "#dc2626", orange: "#ea580c", amber: "#d97706", yellow: "#ca8a04", green: "#16a34a", teal: "#0d9488",
    cyan: "#0891b2", blue: "#2563eb", indigo: "#4f46e5", purple: "#7c3aed", pink: "#db2777", grey: "#6b7280", gray: "#6b7280"
};
// statuses without a colour get one of these, by name, so each keeps its colour
const AUTO_STATUS = ["#dc2626", "#d97706", "#2563eb", "#7c3aed", "#0d9488", "#db2777", "#4f46e5", "#ea580c"];
const ACCENTS = ["#2563eb", "#0d9488", "#16a34a", "#d97706", "#dc2626", "#db2777", "#7c3aed", "#475569"];

// what an end user may change when User Customization is on, and how each value is checked
const PREF_KEYS = {
    style: v => STYLES.includes(v),
    orientation: v => ORIENTS.includes(v),
    connector: v => CONNECTORS.includes(v),
    leafLayout: v => LEAFS.includes(v),
    compact: v => typeof v === "boolean",
    rounded: v => typeof v === "boolean",
    shadow: v => typeof v === "boolean",
    legend: v => typeof v === "boolean",
    miniMap: v => typeof v === "boolean",
    levelBands: v => typeof v === "boolean",
    photos: v => typeof v === "boolean",
    showSubtitle: v => typeof v === "boolean",
    showBadge: v => typeof v === "boolean",
    showStatus: v => typeof v === "boolean",
    showTotals: v => typeof v === "boolean",
    showBody: v => typeof v === "boolean",
    showFooter: v => typeof v === "boolean",
    hiddenFields: v => Array.isArray(v) && v.length <= 100 && v.every(c => typeof c === "string" && /^[A-Z0-9_$#]{1,128}$/.test(c)),
    nodeWidth: v => v === null || (typeof v === "number" && v >= 100 && v <= 420),
    siblingGap: v => typeof v === "number" && v >= 0 && v <= 160,
    levelGap: v => typeof v === "number" && v >= 16 && v <= 240,
    accent: v => v === null || !!safeColor(v),
    highlightColor: v => v === null || !!safeColor(v)
};

const DEFAULTS = {
    ajaxId: null,
    itemsToSubmit: [],
    roles: {},              // role -> column (id, parent or level, title required; subtitle, icon, ...)
    fields: [],             // [{c: COLUMN, l: Label}] Body Columns 1-4 (Detailed / Colored Header / template)
    footerLabel: null,      // heading of the Footer Column (its tooltip)
    rawHtml: [],            // columns whose values are NOT escaped
    style: "AVATAR",        // the developer's default view
    views: STYLES.slice(),  // views users may switch to (the default view always included)
    template: "",           // the Custom Template view is offered only when there is one
    showSubtitle: true,     // card content switches; a view shows only what it has a place for
    showBadge: true,
    showStatus: true,
    showTotals: true,       // team count and roll-up
    showBody: true,         // body fields on views that have a body
    showFooter: true,       // the Footer Column
    hiddenFields: [],       // body fields a user switched off
    orientation: "TB",
    connector: "ROUNDED",   // ROUNDED | ELBOW | CURVED | STRAIGHT
    leafLayout: "AUTO",     // AUTO | ROW | STACK | GRID
    nodeWidth: null,
    nodeHeight: null,
    siblingGap: 24,
    levelGap: 56,
    compact: false,
    shadow: true,
    rounded: true,
    contextMenu: true,
    rememberState: false,
    lazy: false,
    miniMap: false,
    legend: true,
    levelBands: false,
    pathSubtree: false,
    ctrlWheel: true,
    animate: true,
    toolbar: ["search", "zoom", "fit", "expand", "compact", "photos", "details", "orientation", "style", "export", "fullscreen"],
    initialLevels: 2,
    maxChildren: 50,
    orphans: "ROOT",        // ROOT | UNASSIGNED | HIDE
    onClick: "AUTO",        // AUTO | NAVIGATE | SET_ITEM | TOGGLE | EVENT
    linkAttributes: "",     // like a report column link's attributes, e.g. target="_blank"
    clickItem: null,
    highlightPath: "CLICK", // NONE | HOVER | CLICK
    highlightColor: null,
    customize: "NONE",      // NONE | BROWSER | DATABASE - end users can change the look
    prefs: null,            // saved customization (DATABASE: sent by the server)
    prefsKey: null,
    photos: true,
    accent: null,
    heightMode: "VIEWPORT", // FIXED | VIEWPORT | AUTO
    height: 600,
    initialView: "FIT",     // FIT | ROOT | HIGHLIGHT
    imageBlob: false,
    rollupLabel: null,
    minZoom: 0.1,
    maxZoom: 2.5,
    duration: 420,
    maxNodes: 50000,
    fileName: "hierarchy",
    noDataMessage: null,
    dataProvider: null,     // function(request) -> Promise<response>; used by the stand-alone demo
    msg: {}
};

const MSG = {
    CHART: "Hierarchy chart",
    SEARCH: "Search…",
    CLEAR: "Clear search",
    NO_DATA: "No data found",
    NO_MATCH: "No matches",
    MATCHES: "%0 of %1",
    PREV: "Previous match",
    NEXT: "Next match",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    FIT: "Fit to screen",
    RESET: "Reset view",
    EXPAND_ALL: "Expand all",
    COLLAPSE_ALL: "Collapse all",
    LAYOUT: "Layout",
    STYLE: "Node style",
    EXPORT: "Export",
    FULLSCREEN: "Full screen",
    EXIT_FULLSCREEN: "Exit full screen",
    PNG: "PNG image",
    SVG: "SVG image",
    PRINT: "Print / PDF",
    OPEN: "Open",
    FOCUS: "Focus",
    EXPAND_BRANCH: "Expand branch",
    COLLAPSE_BRANCH: "Collapse branch",
    HIGHLIGHT_PATH: "Highlight path",
    SHOW_BRANCH: "Show only this branch",
    ALL: "All",
    MORE: "%0 more",
    MORE_FIELDS: "+%0 more",
    LESS: "Show less",
    UNASSIGNED: "Unassigned",
    LEVEL: "Level %0",
    CTRL_ZOOM: "Use Ctrl + scroll to zoom",
    LOADING: "Loading…",
    ERROR: "The chart data could not be loaded.",
    TEAM: "%0 direct, %1 in total",
    COLLAPSE: "Collapse",
    EXPAND: "Expand",
    TB: "Top to bottom",
    BT: "Bottom to top",
    LR: "Left to right",
    RL: "Right to left",
    RADIAL: "Radial",
    S_AVATAR: "Avatar card",
    S_CLASSIC: "Classic box",
    S_DETAILED: "Detailed card",
    S_PILL: "Compact pill",
    S_BUBBLE: "Bubble",
    S_HEADER: "Colored header",
    S_MINIMAL: "Minimal",
    S_BADGE: "Badge card",
    S_PHOTO: "Photo card",
    S_CUSTOM: "Custom template",
    ONLY_HL: "Show highlighted only",
    SHOW_ALL: "Show everyone",
    NO_HL: "Nothing is highlighted",
    HL_BRANCH: "%0 highlighted in this branch",
    CUSTOMIZE: "Customize",
    CLOSE: "Close",
    C_STYLE: "Card style",
    C_LAYOUT: "Layout",
    C_CONNECTOR: "Connectors",
    C_LEAF: "Teams without reports",
    C_SIZE: "Size and spacing",
    C_WIDTH: "Card width",
    C_HGAP: "Space between cards",
    C_VGAP: "Space between levels",
    C_LOOK: "Look",
    C_COMPACT: "Compact",
    C_ROUNDED: "Rounded corners",
    C_SHADOW: "Shadows",
    C_PHOTOS: "Photos",
    C_ACCENT: "Accent colour",
    C_HLCOLOR: "Highlight colour",
    C_THEME: "Theme",
    C_SHOW: "Show",
    C_LEGEND: "Legend",
    C_MINIMAP: "Mini-map",
    C_BANDS: "Level bands",
    C_RESET: "Reset to default",
    C_SAVED: "Saved for you",
    CN_ROUNDED: "Rounded",
    CN_ELBOW: "Elbow",
    CN_CURVED: "Curved",
    CN_STRAIGHT: "Straight",
    LF_AUTO: "Auto",
    LF_ROW: "Row",
    LF_STACK: "Stack",
    LF_GRID: "Grid",
    DETAILS: "Details",
    C_CONTENT: "Card content",
    C_SUBTITLE: "Subtitle",
    C_BADGE: "Badge",
    C_STATUS: "Status",
    C_TOTALS: "Team and roll-up totals",
    C_BODY: "Details (fields)",
    C_FOOTER: "Footer",
    C_NOT_IN_VIEW: "Not on this card style",
    C_MORE: "More settings",
    NO_COLUMNS: "Choose the Node ID, Title and Parent ID (or Level) columns of this region."
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" };

function esc(v) {
    if (v === null || v === undefined) return "";
    const s = String(v);
    const a = window.apex;
    if (a && a.util && a.util.escapeHTML) return a.util.escapeHTML(s);
    return s.replace(/[&<>"'/]/g, c => ESC[c]);
}

function fmt(s, ...args) {
    return String(s).replace(/%(\d)/g, (m, i) => (args[i] !== undefined ? args[i] : m));
}

function isBlank(v) {
    return v === null || v === undefined || v === "";
}

function debounce(fn, ms) {
    let t;
    return function (...a) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, a), ms);
    };
}

function hashHue(s) {
    let h = 0;
    s = String(s || "");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
}

function initials(s) {
    const parts = String(s || "").replace(/[(),.\-_/]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const a = Array.from(parts[0]);
    const b = parts.length > 1 ? Array.from(parts[parts.length - 1]) : a.slice(1);
    return ((a[0] || "") + (b[0] || "")).toUpperCase();
}

// Lower-case, strip Latin accents and Arabic diacritics, unify Alef/Yeh/Teh
// marbuta forms so "Ahmad" / "Ahmád" and Arabic spelling variants all match.
function norm(s) {
    return String(s || "")
        .normalize("NFD")
        .replace(/[̀-ًͯ-ٰٟـ]/g, "")
        .replace(/[آأإ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .toLowerCase();
}

function stripTags(s) {
    return String(s || "").replace(/<[^>]*>/g, "");
}

const COLOR_RE = [
    /^#[0-9a-f]{3,8}$/i,
    /^(rgb|rgba|hsl|hsla|oklch|lab|lch)\([\d\s.,%/+\-a-z]*\)$/i,
    /^var\(--[\w-]+\)$/,
    /^[a-z]{3,25}$/i
];

function safeColor(c) {
    if (isBlank(c)) return null;
    c = String(c).trim();
    return COLOR_RE.some(r => r.test(c)) ? c : null;
}

function safeUrl(u) {
    if (isBlank(u)) return null;
    u = String(u).trim();
    if (/^\s*(javascript|vbscript):/i.test(u)) return null;
    if (/^data:/i.test(u) && !/^data:image\//i.test(u)) return null;
    return u;
}

function safeClass(c) {
    return isBlank(c) ? "" : String(c).replace(/[^\w\- ]/g, "").trim();
}

// relative luminance of a hex colour; null when unknown
function luminance(c) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || "");
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split("").map(x => x + x).join("");
    const rgb = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255)
        .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function store(key, val) {
    try {
        if (val === undefined) {
            const s = window.sessionStorage.getItem(key);
            return s ? JSON.parse(s) : null;
        }
        window.sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        /* storage unavailable (private mode, blocked) - state simply isn't kept */
    }
    return null;
}

function localStore(key, val) {
    try {
        if (val === undefined) {
            const s = window.localStorage.getItem(key);
            return s ? JSON.parse(s) : null;
        }
        if (val === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        /* storage unavailable - the customization lasts for this page view only */
    }
    return null;
}

// a colour from data: a name (red, amber ...) or any CSS colour
function namedColor(v) {
    if (isBlank(v)) return null;
    const s = String(v).trim();
    return NAMED[s.toLowerCase()] || safeColor(s);
}

// Link Attributes, as on a report column link: target="_blank" class="x" data-x="y" ...
// target decides the window; class, title, rel, data-* and aria-* go on the node
function parseLinkAttrs(s) {
    const out = { target: null, attrs: [] };
    String(s || "").replace(/([a-zA-Z][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|(\S+))/g, (m, name, q, a, b, c) => {
        const k = name.toLowerCase();
        const v = a !== undefined ? a : b !== undefined ? b : c;
        if (k === "target") out.target = v;
        else if (k === "class" || k === "title" || k === "rel" || /^(data|aria)-[\w-]+$/.test(k)) out.attrs.push([k, v]);
        return m;
    });
    return out;
}

// a badge value can hold several chips: "Remote; Contractor" or "Remote, Contractor"
// (a comma only separates when a space follows, so "1,200" stays one chip)
function splitChips(v) {
    return String(v).split(/\s*[;|]\s*|,\s+/).map(s => s.trim()).filter(Boolean);
}

// keeps only known customization keys with valid values
function cleanPrefs(p) {
    const out = {};
    if (!p || typeof p !== "object") return out;
    Object.keys(PREF_KEYS).forEach(k => {
        if (p[k] !== undefined && PREF_KEYS[k](p[k])) out[k] = p[k];
    });
    return out;
}

const easeInOut =t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const r1 = v => Math.round(v * 10) / 10;

const SVG_OPEN = '<svg class="hcp-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    fit: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    expand: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    collapse: '<path d="m7 20 5-5 5 5M7 4l5 5 5-5"/>',
    layout: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>',
    style: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="3.5"/><rect x="3" y="14" width="7" height="7" rx="3.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    exitFs: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    home: '<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    warn: '<path d="M12 4 2.5 20h19L12 4z"/><path d="M12 10v4M12 17.5v.01"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
    compact: '<rect x="4" y="4" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="16" width="16" height="4" rx="1"/>',
    photo: '<circle cx="12" cy="9" r="3.5"/><path d="M5.5 19.5a7 7 0 0 1 13 0"/><rect x="2.5" y="2.5" width="19" height="19" rx="4"/>',
    details: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M7 9h10M7 13h10M7 17h6"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    o_tb: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    o_bt: '<rect x="9" y="16" width="6" height="5" rx="1"/><rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><path d="M12 16v-4M6 8v4h12V8"/>',
    o_lr: '<rect x="3" y="9" width="5" height="6" rx="1"/><rect x="16" y="3" width="5" height="6" rx="1"/><rect x="16" y="15" width="5" height="6" rx="1"/><path d="M8 12h4M16 6h-4v12h4"/>',
    o_rl: '<rect x="16" y="9" width="5" height="6" rx="1"/><rect x="3" y="3" width="5" height="6" rx="1"/><rect x="3" y="15" width="5" height="6" rx="1"/><path d="M16 12h-4M8 6h4v12H8"/>',
    o_radial: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="3.5" r="1.5"/><circle cx="20" cy="15" r="1.5"/><circle cx="4" cy="15" r="1.5"/><path d="M12 9.5V5M14.2 13.2l4.4 1.2M9.8 13.2l-4.4 1.2"/>',
    c_rounded: '<path d="M12 3v5a3 3 0 0 1-3 3H7a3 3 0 0 0-3 3v7M12 8a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3v7"/>',
    c_elbow: '<path d="M12 3v8H4v10M12 11h8v10"/>',
    c_curved: '<path d="M12 3c0 9-8 7-8 18M12 3c0 9 8 7 8 18"/>',
    c_straight: '<path d="M12 3 4 21M12 3l8 18"/>'
};
const icon = n => SVG_OPEN + ICON[n] + "</svg>";

// tiny previews for the style picker (40 x 28)
const STYLE_PREVIEW = {
    AVATAR: '<rect x="8" y="9" width="24" height="16" rx="3"/><circle cx="20" cy="9" r="5" class="f"/><path d="M14 19h12M16 22h8"/>',
    CLASSIC: '<rect x="7" y="6" width="26" height="16" rx="2"/><path d="M7 7h26" class="b"/><path d="M13 13h14M15 17h10"/>',
    DETAILED: '<rect x="6" y="3" width="28" height="22" rx="3"/><circle cx="12" cy="9" r="3" class="f"/><path d="M17 8h11M17 11h7M10 16h20M10 20h20"/>',
    PILL: '<rect x="5" y="9" width="30" height="10" rx="5"/><circle cx="10" cy="14" r="3" class="f"/><path d="M16 14h14"/>',
    BUBBLE: '<circle cx="20" cy="11" r="7" class="f"/><path d="M13 23h14"/>',
    HEADER: '<rect x="6" y="5" width="28" height="18" rx="3"/><path d="M6 8a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v3H6z" class="f"/><path d="M11 16h18M11 19h12"/>',
    MINIMAL: '<path d="M8 8v12" class="b"/><path d="M12 11h18M12 16h12"/>',
    BADGE: '<rect x="6" y="4" width="28" height="20" rx="3"/><circle cx="12" cy="10" r="3" class="f"/><path d="M17 9h11M17 12h7"/><rect x="10" y="17" width="9" height="4" rx="2" class="f"/><rect x="21" y="17" width="8" height="4" rx="2"/>',
    PHOTO: '<rect x="10" y="2" width="20" height="24" rx="3"/><path d="M10 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10H10z" class="f"/><path d="M14 19h12M16 22h8"/>',
    CUSTOM: '<rect x="6" y="5" width="28" height="18" rx="3" stroke-dasharray="3 2"/><path d="m16 11-3 3 3 3M24 11l3 3-3 3"/>'
};

/* ------------------------------------------------------------------ */
/* The chart                                                           */
/* ------------------------------------------------------------------ */

class Chart {
    constructor(regionId, el, options) {
        const o = (this.o = Object.assign({}, DEFAULTS, options || {}));
        this.msg = Object.assign({}, MSG, o.msg || {});
        this.regionId = regionId;
        this.el = el;
        this.regionEl = document.getElementById(regionId) || el;
        // the developer's settings are the default; a user's customization is laid over them
        this.custom = o.customize === "BROWSER" || o.customize === "DATABASE" ? o.customize : null;
        this.base = {};
        Object.keys(PREF_KEYS).forEach(k => (this.base[k] = o[k] === undefined ? null : o[k]));
        this.prefsKey = "hcp-prefs:" + (o.prefsKey || location.pathname + ":" + regionId);
        this.prefs = {};
        if (this.custom) {
            this.prefs = cleanPrefs(this.custom === "BROWSER" ? localStore(this.prefsKey) : o.prefs);
            Object.assign(o, this.prefs);
        }
        // the views users may pick; the developer's default view is always one of them
        const def = STYLES.includes(this.base.style) && (this.base.style !== "CUSTOM" || o.template) ? this.base.style : "AVATAR";
        const allowed = (Array.isArray(o.views) && o.views.length ? o.views : STYLES)
            .filter(s => s === def || (STYLES.includes(s) && (s !== "CUSTOM" || o.template)));
        this.views = STYLES.filter(s => s === def || allowed.includes(s));
        this.base.style = def;
        this.style = this.views.includes(o.style) ? o.style : def;
        this.orient = ORIENTS.includes(o.orientation) ? o.orientation : "TB";
        this.rawSet = new Set((o.rawHtml || []).map(c => String(c).toUpperCase()));
        this.toolbar = new Set(o.toolbar || []);
        if (this.custom) this.toolbar.add("customize");
        this.linkAttrs = parseLinkAttrs(o.linkAttributes);
        this.onlyHl = false;
        this.stFilter = null;
        this.stateKey = "hcp:" + location.pathname + ":" + regionId;
        this.nodes = new Map();
        this.roots = [];
        this.V = [];
        this.linkEls = new Map();
        this.panelEls = new Map();
        this.moreNodes = new Map();
        this.t = zoomIdentity;
        this.matches = [];
        this.mi = -1;
        this.hl = new Set();
        this.path = null;
        this.sel = null;
        this.viewRoot = null;
        this.focusId = null;
        this.anim = null;
        this.warned = {};
        this._build();
        this._bind();
        this._restore();
    }

    /* ---------------- DOM scaffolding ---------------- */

    _build() {
        const m = this.msg;
        const tb = this.toolbar;
        const btn = (act, ic, label, extra) =>
            `<button type="button" class="hcp-btn" data-act="${act}" title="${esc(label)}" aria-label="${esc(label)}"${extra || ""}>${icon(ic)}</button>`;
        let bar = "";
        if (tb.size) {
            bar += '<div class="hcp-tb" role="toolbar" aria-label="' + esc(m.CHART) + '">';
            if (tb.has("search")) {
                bar += '<div class="hcp-search">' + icon("search") +
                    `<input type="search" class="hcp-q" placeholder="${esc(m.SEARCH)}" aria-label="${esc(m.SEARCH)}" autocomplete="off" spellcheck="false" enterkeyhint="search">` +
                    '<span class="hcp-count" aria-live="polite"></span>' +
                    btn("prev", "up", m.PREV, " hidden") + btn("next", "down", m.NEXT, " hidden") +
                    "</div>";
            }
            bar += '<div class="hcp-tools">';
            if (tb.has("zoom")) bar += '<span class="hcp-grp">' + btn("zoomOut", "zoomOut", m.ZOOM_OUT) + btn("zoomIn", "zoomIn", m.ZOOM_IN) + "</span>";
            if (tb.has("fit")) bar += '<span class="hcp-grp">' + btn("fit", "fit", m.FIT) + btn("reset", "reset", m.RESET) + "</span>";
            if (tb.has("expand")) bar += '<span class="hcp-grp">' + btn("expandAll", "expand", m.EXPAND_ALL) + btn("collapseAll", "collapse", m.COLLAPSE_ALL) + "</span>";
            // quick switches: highlighted only, compact, photos, details
            let sw = "";
            if (tb.has("highlighted")) sw += btn("onlyHl", "filter", m.ONLY_HL, ' aria-pressed="false"');
            if (tb.has("compact")) sw += btn("compact", "compact", m.C_COMPACT, ' aria-pressed="false"');
            if (tb.has("photos")) sw += btn("photos", "photo", m.C_PHOTOS, ' aria-pressed="false"');
            if (tb.has("details")) sw += btn("details", "details", m.DETAILS, ' aria-pressed="false"');
            if (sw) bar += '<span class="hcp-grp">' + sw + "</span>";
            let g = "";
            if (tb.has("orientation")) g += btn("menuLayout", "layout", m.LAYOUT, ' aria-haspopup="menu"');
            if (tb.has("style")) g += btn("menuStyle", "style", m.STYLE, ' aria-haspopup="menu"');
            if (tb.has("export")) g += btn("menuExport", "download", m.EXPORT, ' aria-haspopup="menu"');
            if (tb.has("fullscreen")) g += btn("fullscreen", "fullscreen", m.FULLSCREEN);
            if (tb.has("customize")) g += btn("customize", "sliders", m.CUSTOMIZE, ' aria-expanded="false"');
            if (g) bar += '<span class="hcp-grp">' + g + "</span>";
            bar += "</div></div>";
        }
        this.el.innerHTML =
            bar +
            '<nav class="hcp-crumbs" hidden></nav>' +
            '<div class="hcp-vp">' +
            '<div class="hcp-stage">' +
            '<svg class="hcp-svg" aria-hidden="true" focusable="false"><g class="hcp-bands"></g><g class="hcp-panels"></g><g class="hcp-lks"></g></svg>' +
            `<div class="hcp-nodes" role="tree" aria-label="${esc(m.CHART)}"></div>` +
            "</div>" +
            '<div class="hcp-legend" hidden></div>' +
            '<canvas class="hcp-mini" hidden></canvas>' +
            '<div class="hcp-hint" aria-hidden="true"></div>' +
            '<div class="hcp-msg" hidden></div>' +
            '<div class="hcp-busy" hidden><span class="hcp-spin"></span></div>' +
            "</div>";
        const q = s => this.el.querySelector(s);
        this.vp = q(".hcp-vp");
        this.stage = q(".hcp-stage");
        this.svg = q(".hcp-svg");
        this.gBands = q(".hcp-bands");
        this.gPanels = q(".hcp-panels");
        this.gLinks = q(".hcp-lks");
        this.layer = q(".hcp-nodes");
        this.legendEl = q(".hcp-legend");
        this.mini = q(".hcp-mini");
        this.hint = q(".hcp-hint");
        this.msgEl = q(".hcp-msg");
        this.busy = q(".hcp-busy");
        this.crumbs = q(".hcp-crumbs");
        this.qEl = q(".hcp-q");
        this._classes();
        this._sizeViewport();
    }

    _classes() {
        const o = this.o;
        const c = this.el.classList;
        c.add("hcp");
        this.rtl = getComputedStyle(this.el).direction === "rtl";
        c.toggle("hcp--rtl", this.rtl);
        // this.orient is what the developer / user chose; this.eo is what is drawn
        // (an RTL page mirrors Left-to-Right into Right-to-Left and vice versa)
        this.eo = this.rtl && this.orient === "LR" ? "RL" : this.rtl && this.orient === "RL" ? "LR" : this.orient;
        ORIENTS.forEach(x => c.remove("hcp--" + x.toLowerCase()));
        c.add("hcp--" + this.eo.toLowerCase());
        STYLES.forEach(x => c.remove("hcp-s-" + x.toLowerCase()));
        c.add("hcp-s-" + this.style.toLowerCase());
        c.toggle("hcp--compact", !!o.compact);
        c.toggle("hcp--noshadow", !o.shadow);
        c.toggle("hcp--square", !o.rounded);
        c.toggle("hcp--only", !!this.onlyHl);
        const setVar = (name, v) => (safeColor(v) ? this.el.style.setProperty(name, safeColor(v)) : this.el.style.removeProperty(name));
        setVar("--hcp-hl", o.highlightColor);
        setVar("--hcp-primary", o.accent);
        this._syncSwitches();
    }

    // does the current view have a place for this slot (photo, subtitle, badge, status, body)?
    _has(slot) {
        return (SLOTS[this.style] || SLOTS.AVATAR).includes(slot);
    }

    // a slot is drawn when the view has it and its card content switch is on
    _show(slot) {
        const o = this.o;
        switch (slot) {
            case "subtitle": return this._has("subtitle") && o.showSubtitle !== false;
            case "badge": return this._has("badge") && o.showBadge !== false;
            case "status": return this._has("status") && o.showStatus !== false;
            case "body": return this._has("body") && o.showBody !== false && this.fields && this.fields.length > 0;
            case "totals": return o.showTotals !== false;
            case "footer": return this._has("footer") && o.showFooter !== false && this.ci && this.ci.footer >= 0;
            default: return this._has(slot);
        }
    }

    // toolbar switches show their state; Details is off on views without a body
    _syncSwitches() {
        const o = this.o;
        const set = (act, on, disabled) => {
            const b = this.el.querySelector(`[data-act="${act}"]`);
            if (!b) return;
            b.classList.toggle("is-on", !!on && !disabled);
            b.setAttribute("aria-pressed", String(!!on && !disabled));
            b.disabled = !!disabled;
            if (act === "details") b.title = disabled ? this.msg.DETAILS + " - " + this.msg.C_NOT_IN_VIEW : this.msg.DETAILS;
        };
        set("compact", o.compact);
        set("photos", o.photos !== false, !this._has("photo"));
        set("details", o.showBody !== false, !this._has("body") || !(this.fields && this.fields.length));
    }

    _sizeViewport() {
        const o = this.o;
        if (o.heightMode === "FIXED") {
            this.vp.style.height = Math.max(160, +o.height || 600) + "px";
        } else if (o.heightMode === "VIEWPORT") {
            if (this.isFs) return (this.vp.style.height = "");
            const top = this.vp.getBoundingClientRect().top + window.scrollY;
            const h = window.innerHeight - (top - window.scrollY) - 24;
            this.vp.style.height = Math.max(360, Math.min(h, window.innerHeight - 40)) + "px";
        } else if (!this.vp.style.height) {
            this.vp.style.height = "420px";
        }
    }

    /* ---------------- events ---------------- */

    _bind() {
        const o = this.o;
        // zoom & pan
        this.zoom = d3zoom()
            .scaleExtent([o.minZoom, o.maxZoom])
            .filter(ev => {
                if (ev.target.closest && ev.target.closest(".hcp-cfg")) return false;
                if (ev.type === "wheel") {
                    if (o.ctrlWheel && !(ev.ctrlKey || ev.metaKey)) {
                        this._hint();
                        return false;
                    }
                    return true;
                }
                if (ev.type === "dblclick") return false;
                if (ev.button) return false;
                return !ev.target.closest(".hcp-tg,.hcp-legend,.hcp-mini,.hcp-menu,input,button,a");
            })
            .on("zoom", ev => {
                this.t = ev.transform;
                this._applyTransform();
            })
            .on("end", () => {
                this._cull();
                this._drawMini();
            });
        this.vpSel = select(this.vp).call(this.zoom).on("dblclick.zoom", null);

        // toolbar
        this.el.addEventListener("click", ev => {
            const b = ev.target.closest("[data-act]");
            if (!b || !this.el.contains(b)) return;
            this._act(b.getAttribute("data-act"), b, ev);
        });

        // node interactions (delegated)
        const L = this.layer;
        L.addEventListener("click", ev => {
            const el = ev.target.closest(".hcp-node");
            if (!el) return;
            const n = this._byEl(el);
            if (!n) return;
            if (n.more) return this._showMore(n.parent);
            if (ev.target.closest(".hcp-tg")) return this.toggle(n.id);
            this._click(n, ev);
        });
        L.addEventListener("dblclick", ev => {
            const n = this._byEl(ev.target.closest(".hcp-node"));
            if (n && !n.more) this._fire("node_dblclick", this._eventData(n));
        });
        L.addEventListener("contextmenu", ev => {
            const n = this._byEl(ev.target.closest(".hcp-node"));
            if (!n || n.more || !o.contextMenu) return;
            ev.preventDefault();
            this._nodeMenu(n, { x: ev.clientX, y: ev.clientY });
        });
        L.addEventListener("mouseover", ev => {
            if (o.highlightPath !== "HOVER") return;
            const n = this._byEl(ev.target.closest(".hcp-node"));
            if (n && !n.more && n !== this.path) this.setPath(n.id);
        });
        L.addEventListener("mouseleave", () => {
            if (o.highlightPath === "HOVER") this.clearPath();
        });
        L.addEventListener("keydown", ev => this._key(ev));
        L.addEventListener("focusin", ev => {
            const n = this._byEl(ev.target.closest(".hcp-node"));
            if (n) this._setFocus(n, false);
        });
        // broken photo -> initials
        L.addEventListener("error", ev => {
            if (ev.target.tagName === "IMG") ev.target.remove();
        }, true);

        // the viewport clips with overflow:hidden, but the browser still scrolls it to show a
        // focused element (a clicked card, a control in the Customize panel) - pan with the zoom only
        this.vp.addEventListener("scroll", () => {
            if (this.vp.scrollTop || this.vp.scrollLeft) {
                this.vp.scrollTop = 0;
                this.vp.scrollLeft = 0;
            }
        });

        this.vp.addEventListener("keydown", ev => {
            if (ev.target.closest("input")) return;
            if (ev.key === "+" || ev.key === "=") { this.zoomBy(1.25); ev.preventDefault(); }
            else if (ev.key === "-" || ev.key === "_") { this.zoomBy(0.8); ev.preventDefault(); }
            else if (ev.key === "0") { this.fit(); ev.preventDefault(); }
        });

        // search
        if (this.qEl) {
            const run = debounce(() => this.search(this.qEl.value), 220);
            this.qEl.addEventListener("input", run);
            this.qEl.addEventListener("keydown", ev => {
                if (ev.key === "Enter") { ev.preventDefault(); this._step(ev.shiftKey ? -1 : 1); }
                else if (ev.key === "Escape") { this.qEl.value = ""; this.search(""); }
            });
        }

        // legend filter
        this.legendEl.addEventListener("click", ev => {
            const s = ev.target.closest("[data-st]");
            if (s) {
                const v = s.getAttribute("data-st");
                return this.statusFilter(this.stFilter === v ? null : v);
            }
            const b = ev.target.closest("[data-lg]");
            if (!b) return;
            const v = b.getAttribute("data-lg");
            this._legendFilter(this.lgFilter === v ? null : v);
        });

        // minimap navigation
        const mm = ev => {
            if (!this.miniMap) return;
            const r = this.mini.getBoundingClientRect();
            const p = this.miniMap.toWorld(ev.clientX - r.left, ev.clientY - r.top);
            const k = this.t.k;
            this._setTransform(zoomIdentity.translate(this.vw / 2 - p.x * k, this.vh / 2 - p.y * k).scale(k), 0);
        };
        this.mini.addEventListener("pointerdown", ev => {
            this.mini.setPointerCapture(ev.pointerId);
            this.miniDrag = true;
            mm(ev);
        });
        this.mini.addEventListener("pointermove", ev => this.miniDrag && mm(ev));
        this.mini.addEventListener("pointerup", () => (this.miniDrag = false));

        // resizing
        const onResize = debounce(() => {
            this._sizeViewport();
            this._measureVp();
            if (this.pending) this._render(true);
            this._cull();
            this._drawMini();
        }, 120);
        window.addEventListener("resize", onResize);
        if (window.ResizeObserver) {
            this.ro = new ResizeObserver(onResize);
            this.ro.observe(this.vp);
        }
        if (window.apex && apex.jQuery) apex.jQuery(window).on("apexwindowresized", onResize);
        document.addEventListener("fullscreenchange", () => {
            const fs = document.fullscreenElement === this.el;
            if (fs !== this.isFs) this._fsChanged(fs);
        });
    }

    _itemVal(name) {
        if (window.apex && apex.item) return apex.item(name).getValue();
        const e = document.getElementById(name);
        return e ? e.value : null;
    }

    _ids(v) {
        if (isBlank(v)) return [];
        return (Array.isArray(v) ? v : String(v).split(/[:,]/)).map(s => String(s).trim()).filter(Boolean);
    }

    _act(a, b) {
        switch (a) {
            case "zoomIn": return this.zoomBy(1.3);
            case "zoomOut": return this.zoomBy(1 / 1.3);
            case "fit": return this.fit();
            case "reset": return this.reset();
            case "expandAll": return this.expandAll();
            case "collapseAll": return this.collapseAll();
            case "prev": return this._step(-1);
            case "next": return this._step(1);
            case "fullscreen": return this.toggleFullscreen();
            case "onlyHl": return this.showHighlightedOnly(!this.onlyHl);
            case "compact": return this._pref("compact", !this.o.compact);
            case "photos": return this._pref("photos", this.o.photos === false);
            case "details": return this._pref("showBody", !this.o.showBody);
            case "customize": return this._cfgToggle();
            case "crumb": {
                const id = b.getAttribute("data-id");
                return this.drillTo(id === "" ? null : id);
            }
            case "menuLayout":
                return this._menu(b, ORIENTS.map(x => ({ label: this.msg[x], checked: x === this.orient, run: () => this._pref("orientation", x) })));
            case "menuStyle":
                return this._menu(b, this.views.map(s => ({ label: this.msg["S_" + s], checked: s === this.style, run: () => this._pref("style", s) })));
            case "menuExport":
                return this._menu(b, [
                    { label: this.msg.PNG, run: () => this.exportImage("png") },
                    { label: this.msg.SVG, run: () => this.exportImage("svg") },
                    { label: this.msg.PRINT, run: () => this.print() }
                ]);
        }
    }

    _hint() {
        const m = this.msg.CTRL_ZOOM.replace("Ctrl", /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");
        this.hint.textContent = m;
        this.hint.classList.add("is-on");
        clearTimeout(this.hintT);
        this.hintT = setTimeout(() => this.hint.classList.remove("is-on"), 1300);
    }

    /* ---------------- data ---------------- */

    _request(params) {
        const o = this.o;
        if (o.dataProvider) return Promise.resolve(o.dataProvider(params, this));
        if (!window.apex || !apex.server) return Promise.reject(new Error("apex.server not available"));
        return new Promise((resolve, reject) => {
            apex.server.plugin(o.ajaxId, Object.assign({ pageItems: o.itemsToSubmit }, params), {
                dataType: "json",
                success: resolve,
                error: (xhr, status, err) => reject(new Error((xhr && xhr.responseText) || err || status))
            });
        });
    }

    load(isRefresh) {
        this._busy(true);
        if (isRefresh) this._fire("before_refresh", {}, "apexbeforerefresh");
        return this._request({ x01: "DATA" })
            .then(res => {
                this._busy(false);
                if (res && res.error) throw new Error(res.error);
                this._ingest(res, isRefresh ? "refresh" : "replace");
                this._render(true);
                if (isRefresh) this._fire("after_refresh", {}, "apexafterrefresh");
            })
            .catch(err => {
                this._busy(false);
                if (err && err.config) this._showMsg(err.message, " ");
                else this._showMsg(this.msg.ERROR, String(err && err.message ? err.message : err));
                if (window.console) console.error("Hierarchy Pro:", err);
            });
    }

    refresh() {
        return this.load(true);
    }

    _busy(on) {
        clearTimeout(this.busyT);
        if (on) this.busyT = setTimeout(() => (this.busy.hidden = false), 150);
        else this.busy.hidden = true;
    }

    _warn(kind, text, list) {
        if (this.warned[kind]) return;
        this.warned[kind] = true;
        if (window.console) console.warn("Hierarchy Pro [" + this.regionId + "]: " + text, list && list.length ? list.slice(0, 20) : "");
    }

    // Column roles come from the region's Columns settings - nothing is guessed from aliases.
    // Node ID, Title and Parent ID (or Level) are required.
    _resolveRoles(cols) {
        const o = this.o;
        const idx = {};
        const roles = {};
        Object.keys(o.roles || {}).forEach(r => {
            if (!isBlank(o.roles[r])) roles[r] = String(o.roles[r]).toUpperCase();
        });
        Object.keys(roles).forEach(r => {
            idx[r] = cols.indexOf(roles[r]);
            if (idx[r] < 0) this._warn("col-" + r, "the " + r + " column " + roles[r] + " is not in the query.");
        });
        if (!(idx.id >= 0) || !(idx.title >= 0) || !(idx.parent >= 0 || idx.level >= 0)) {
            const e = new Error(this.msg.NO_COLUMNS);
            e.config = true;
            throw e;
        }
        this.ci = idx;
        this.roles = roles;
        this.fields = (o.fields || [])
            .map(f => ({ c: String(f.c).toUpperCase(), i: cols.indexOf(String(f.c).toUpperCase()), l: f.l, raw: this.rawSet.has(String(f.c).toUpperCase()) }))
            .filter(f => f.i >= 0);
    }

    _v(n, role) {
        if (n.virt) return role === "title" ? n.vt : null;
        const i = this.ci[role];
        return i >= 0 && n.r ? n.r[i] : null;
    }

    _ingest(res, mode) {
        const cols = (res.cols || []).map(c => String(c).toUpperCase());
        const rows = res.rows || [];
        const o = this.o;
        if (mode !== "merge") {
            const prev = mode === "refresh" ? this.nodes : null;
            this.cols = cols;
            this._resolveRoles(cols);
            this.nodes = new Map();
            this.roots = [];
            this.moreNodes.clear();
            this.prevState = prev;
            this.lazy = !!o.lazy && this.ci.parent >= 0;
            this.truncated = !!res.truncated;
            if (res.truncated) this._warn("trunc", "the query returned more rows than the region's row limit; the chart is incomplete.");
        }
        const ci = this.ci;
        const levelMode = !(ci.parent >= 0) && ci.level >= 0;
        const stack = [];
        const added = [];
        const dups = [];
        for (let k = 0; k < rows.length; k++) {
            const r = rows[k];
            const id = isBlank(r[ci.id]) ? null : String(r[ci.id]);
            if (id === null) continue;
            if (this.nodes.has(id)) {
                if (mode !== "merge") dups.push(id);
                continue;
            }
            if (this.nodes.size >= o.maxNodes) {
                this._warn("max", "more than " + o.maxNodes + " nodes; the rest were ignored.");
                break;
            }
            let pid = null;
            if (levelMode) {
                const lv = Math.max(1, parseInt(r[ci.level], 10) || 1);
                stack.length = lv;
                stack[lv - 1] = id;
                pid = lv > 1 && stack[lv - 2] ? stack[lv - 2] : null;
            } else if (ci.parent >= 0) {
                pid = isBlank(r[ci.parent]) ? null : String(r[ci.parent]);
            }
            const n = {
                id, pid, r, seq: this.seq = (this.seq || 0) + 1,
                kids: [], parent: null, exp: false, lim: o.maxChildren, loaded: !this.lazy, cc: null
            };
            if (res.counts && res.counts[id] !== undefined) n.cc = +res.counts[id];
            this.nodes.set(id, n);
            added.push(n);
        }
        if (dups.length) this._warn("dup", dups.length + " duplicate node id(s) ignored:", dups);

        // link
        const orphans = [];
        for (const n of added) {
            if (n.pid === null || n.pid === n.id) {
                if (n.pid === n.id) this._warn("self", "node(s) pointing at themselves as parent were made roots.", [n.id]);
                this.roots.push(n);
                continue;
            }
            const p = this.nodes.get(n.pid);
            if (p) {
                n.parent = p;
                p.kids.push(n);
            } else orphans.push(n);
        }
        if (orphans.length) {
            if (this.lazy && mode === "merge") {
                orphans.forEach(n => this.roots.push(n));
            } else {
                this._warn("orphan", orphans.length + " node(s) reference a parent that is not in the data (" + o.orphans + "):", orphans.map(n => n.id));
                if (o.orphans === "HIDE") orphans.forEach(n => this.nodes.delete(n.id));
                else if (o.orphans === "UNASSIGNED") {
                    let u = this.nodes.get("\u0001unassigned");
                    if (!u) {
                        u = { id: "\u0001unassigned", pid: null, virt: true, vt: this.msg.UNASSIGNED, r: null, kids: [], parent: null, exp: false, lim: o.maxChildren, loaded: true, seq: 1e12 };
                        this.nodes.set(u.id, u);
                        this.roots.push(u);
                    }
                    orphans.forEach(n => { n.parent = u; u.kids.push(n); });
                } else orphans.forEach(n => this.roots.push(n));
            }
        }
        if (mode !== "merge") this._breakCycles();
        this._sortAll(added, mode);
        this._derive();
        if (mode !== "merge") this._initExpanded(res);
    }

    // Nodes not reachable from a root sit on a cycle. Cut each cycle at the
    // first node found on it, warn, and make that node a root.
    _breakCycles() {
        const seen = new Set();
        const walk = start => {
            const st = [start];
            while (st.length) {
                const n = st.pop();
                if (seen.has(n)) continue;
                seen.add(n);
                for (const k of n.kids) st.push(k);
            }
        };
        this.roots.forEach(walk);
        if (seen.size === this.nodes.size) return;
        const cut = [];
        for (const n of this.nodes.values()) {
            if (seen.has(n)) continue;
            const chain = new Set();
            let c = n;
            while (c && !chain.has(c) && !seen.has(c)) {
                chain.add(c);
                c = c.parent;
            }
            if (c && chain.has(c)) {
                const p = c.parent;
                if (p) p.kids.splice(p.kids.indexOf(c), 1);
                c.parent = null;
                this.roots.push(c);
                cut.push(c.id);
                walk(c);
            }
        }
        if (cut.length) this._warn("cycle", cut.length + " cycle(s) in the parent/child data were broken at:", cut);
    }

    // siblings keep the query's ORDER BY (rows that arrive later in lazy mode go after)
    _sortAll(added, mode) {
        const cmp = (a, b) => a.seq - b.seq;
        if (mode === "merge") {
            const ps = new Set(added.map(n => n.parent).filter(Boolean));
            ps.forEach(p => p.kids.sort(cmp));
        } else {
            for (const n of this.nodes.values()) if (n.kids.length > 1) n.kids.sort(cmp);
            this.roots.sort(cmp);
        }
    }

    // depth, descendant counts, roll-ups, legend - iterative so deep trees can't blow the stack
    _derive() {
        const ri = this.ci.rollup;
        const order = [];
        const st = this.roots.map(r => ((r.depth = 0), r));
        while (st.length) {
            const n = st.pop();
            order.push(n);
            for (const k of n.kids) {
                k.depth = n.depth + 1;
                st.push(k);
            }
        }
        for (let i = order.length - 1; i >= 0; i--) {
            const n = order[i];
            let d = 0, s = ri >= 0 && n.r && !isBlank(n.r[ri]) ? +n.r[ri] || 0 : 0, h = 0;
            for (const k of n.kids) {
                d += 1 + k.desc;
                s += k.roll;
                h += k.hlc + (this._flag(k) ? 1 : 0);
            }
            n.desc = d;
            n.roll = s;
            n.hlc = h;
            n.txt = null;
        }
        this.order = order;
        // highlight statuses with their colour and how many nodes have each
        const sm = new Map();
        for (const n of order) {
            const f = this._flag(n);
            if (!f || !f.label) continue;
            const e = sm.get(f.label);
            if (e) e.count++;
            else sm.set(f.label, { color: f.color, count: 1 });
        }
        this.statusMap = sm;
        // legend
        const lg = new Map();
        if (this.ci.legend >= 0) {
            for (const n of order) {
                const l = this._v(n, "legend");
                if (!isBlank(l) && !lg.has(l)) lg.set(l, safeColor(this._v(n, "color")));
            }
        }
        this.legendMap = lg;
    }

    _initExpanded() {
        const o = this.o;
        const saved = o.rememberState ? store(this.stateKey) : null;
        const prev = this.prevState;
        for (const n of this.nodes.values()) {
            if (prev && prev.has(n.id)) {
                const p = prev.get(n.id);
                n.exp = p.exp;
                n.lim = Math.max(p.lim || o.maxChildren, o.maxChildren);
            } else if (saved && saved.e) {
                n.exp = false;
            } else {
                n.exp = n.depth < (o.initialLevels || 1) - 1;
            }
            if (!this.lazy) n.loaded = true;
            else n.loaded = n.kids.length > 0 || n.cc === 0;
        }
        if (saved && saved.e && !prev) saved.e.forEach(id => { const n = this.nodes.get(id); if (n) n.exp = true; });
        if (this.stFilter && !this.statusMap.has(this.stFilter)) this.stFilter = null;
        if (this.viewRoot) this.viewRoot = this.nodes.get(this.viewRoot.id) || null;
        if (this.sel) this.sel = this.nodes.get(this.sel.id) || null;
        this.prevState = null;
    }

    hasKids(n) {
        return !n.more && (n.kids.length > 0 || (this.lazy && !n.loaded && n.cc > 0));
    }

    kidCount(n) {
        return this.lazy && !n.loaded ? n.cc || 0 : n.kids.length;
    }

    /* ---------------- state persistence ---------------- */

    _save() {
        if (!this.o.rememberState) return;
        const e = [];
        for (const n of this.nodes.values()) if (n.exp) e.push(n.id);
        store(this.stateKey, { e, o: this.orient, s: this.style, v: this.viewRoot ? this.viewRoot.id : null });
    }

    _restore() {
        if (!this.o.rememberState) return;
        const s = store(this.stateKey);
        if (!s) return;
        // a saved customization already decides orientation and style
        if (ORIENTS.includes(s.o) && !this.custom) this.orient = s.o;
        if (STYLES.includes(s.s) && (s.s !== "CUSTOM" || this.o.template) && !this.custom) this.style = s.s;
        this.savedView = s.v;
        this._classes();
    }

    /* ---------------- visible tree ---------------- */

    _visible() {
        const out = [];
        let base = this.viewRoot ? [this.viewRoot] : this.roots;
        if (this.savedView) {
            const v = this.nodes.get(this.savedView);
            if (v) { this.viewRoot = v; base = [v]; }
            this.savedView = null;
        }
        // "highlighted only": the highlighted nodes and the chain above them, all open
        const keep = this.onlyHl ? this._keepSet() : null;
        if (keep) base = base.filter(n => keep.has(n));
        const st = [];
        for (let i = base.length - 1; i >= 0; i--) st.push([base[i], 0, null]);
        while (st.length) {
            const [n, d, vp] = st.pop();
            n.vd = d;
            n.vp = vp;
            out.push(n);
            let shown = [];
            const kids = keep ? n.kids.filter(k => keep.has(k)) : n.kids;
            if ((keep || n.exp) && kids.length && !n.more) {
                shown = kids.slice(0, n.lim);
                if (kids.length > n.lim) {
                    let m = this.moreNodes.get(n.id);
                    if (!m) {
                        m = { id: "\u0001more:" + n.id, more: true, parent: n, kids: [], exp: false };
                        this.moreNodes.set(n.id, m);
                    }
                    m.remaining = kids.length - n.lim;
                    shown.push(m);
                }
            }
            n.shown = shown;
            for (let i = shown.length - 1; i >= 0; i--) st.push([shown[i], d + 1, n]);
        }
        return out;
    }

    /* ---------------- node markup ---------------- */

    _cell(n, role) {
        const v = this._v(n, role);
        if (isBlank(v)) return "";
        const i = this.ci[role];
        return i >= 0 && this.rawSet.has(this.cols[i]) ? String(v) : esc(v);
    }

    _plain(n, role) {
        const v = this._v(n, role);
        return isBlank(v) ? "" : stripTags(v);
    }

    _img(n) {
        if (n.virt || this.o.photos === false) return null;
        const u = safeUrl(this._v(n, "image"));
        if (u) return u;
        if (this.o.imageBlob && window.apex && apex.server && apex.server.pluginUrl) {
            return apex.server.pluginUrl(this.o.ajaxId, { x01: "IMG", x02: n.id });
        }
        return null;
    }

    _avatar(n, size) {
        const t = this._plain(n, "title");
        const ic = safeClass(this._v(n, "icon"));
        const img = this._img(n);
        const hue = hashHue(t);
        if (n.virt) return `<span class="hcp-av ${size} hcp-av--ic">${icon("users")}</span>`;
        if (!img && ic) return `<span class="hcp-av ${size} hcp-av--ic"><span class="fa ${ic}" aria-hidden="true"></span></span>`;
        return `<span class="hcp-av ${size}" style="--hcp-avh:${hue}"><span class="hcp-ini" aria-hidden="true">${esc(initials(t))}</span>` +
            (img ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async">` : "") + "</span>";
    }

    // badges take the node's colour
    _badge(n) {
        const b = this._cell(n, "badge");
        return b ? `<span class="hcp-badge">${b}</span>` : "";
    }

    // one chip per badge value ("Remote; Contractor")
    _badgeChips(n) {
        const v = this._v(n, "badge");
        if (isBlank(v)) return "";
        const raw = this.rawSet.has(this.cols[this.ci.badge]);
        return splitChips(raw ? v : stripTags(v)).map(t => `<span class="hcp-chip">${raw ? t : esc(t)}</span>`).join("");
    }

    // the Footer Column: its own section at the foot of the card, below the team and roll-up totals
    _footer(n) {
        if (!this._show("footer")) return "";
        const v = this._cell(n, "footer");
        return v ? `<div class="hcp-foot"${this.o.footerLabel ? ` title="${esc(this.o.footerLabel)}"` : ""}>${v}</div>` : "";
    }

    // the Highlight Column: Y / 1 / true = highlighted; any other text (except N / 0) is a status such
    // as "Absent" - shown as a chip. The colour comes from the Highlight Color Column of the same row
    // (red, amber, #16a34a ...); without one each status gets a fixed colour of its own.
    _flag(n) {
        if (n.hli !== undefined) return n.hli;
        const v = n.virt ? null : this._v(n, "highlight");
        let f = null;
        if (!isBlank(v) && v !== false) {
            const s = stripTags(String(v)).trim();
            const c = namedColor(this._v(n, "statusColor"));
            if (/^(y|yes|1|true)$/i.test(s)) f = { label: null, color: c };
            else if (s && !/^(n|no|0|false)$/i.test(s)) f = { label: s, color: c || AUTO_STATUS[hashHue(s.toLowerCase()) % AUTO_STATUS.length] };
        }
        return (n.hli = f);
    }

    _status(n) {
        const f = this._flag(n);
        return f && f.label ? `<span class="hcp-status"><i aria-hidden="true"></i>${esc(f.label)}</span>` : "";
    }

    // highlighted nodes (or those of the chosen status) plus every ancestor
    _keepSet() {
        const keep = new Set();
        const sf = this.stFilter;
        for (const n of this.nodes.values()) {
            const f = this._flag(n);
            const hit = sf ? !!f && f.label === sf : !!f || this.hl.has(n.id);
            if (!hit) continue;
            for (let c = n; c && !keep.has(c); c = c.parent) keep.add(c);
        }
        return keep;
    }

    showHighlightedOnly(on) {
        on = !!on;
        if (on && !this._keepSet().size) {
            this._showToast(this.msg.NO_HL);
            on = false;
        }
        this.onlyHl = on;
        this._classes();
        const b = this.el.querySelector('[data-act="onlyHl"]');
        if (b) {
            b.classList.toggle("is-on", on);
            b.setAttribute("aria-pressed", String(on));
            b.title = on ? this.msg.SHOW_ALL : this.msg.ONLY_HL;
            b.setAttribute("aria-label", b.title);
        }
        if (!this.nodes.size) return;
        this.update({ animate: true });
        this.fit();
    }

    _icon(n) {
        const ic = safeClass(this._v(n, "icon"));
        return ic ? `<span class="hcp-icon fa ${ic}" aria-hidden="true"></span>` : "";
    }

    // the body: label / value rows of Body Columns 1-4 (label = the column heading), minus any a user switched off
    _fieldsHtml(n) {
        const off = new Set(this.o.hiddenFields || []);
        let h = "";
        for (const f of this.fields) {
            const v = n.r ? n.r[f.i] : null;
            if (isBlank(v) || off.has(f.c)) continue;
            const plain = stripTags(v);
            h += `<div class="hcp-fr"><dt title="${esc(f.l)}">${esc(f.l)}</dt><dd title="${esc(plain)}">${f.raw ? String(v) : esc(v)}</dd></div>`;
        }
        return h ? `<dl class="hcp-fl">${h}</dl>` : "";
    }

    // team size and roll-up total (inline = the small form for pill and minimal)
    _meta(n, inline) {
        const h = this.o.showTotals !== false && !(n.virt && !n.desc) ? this._totals(n, inline) : "";
        if (!h) return "";
        return inline ? `<span class="hcp-meta hcp-meta--in">${h}</span>` : `<div class="hcp-meta">${h}</div>`;
    }

    _totals(n, inline) {
        let h = "";
        const team = n.desc || (this.lazy && !n.loaded ? n.cc || 0 : 0);
        if (team > 0) {
            h += `<span class="hcp-team" title="${esc(fmt(this.msg.TEAM, this.kidCount(n), team))}">${icon("users")}${this._num(team)}</span>`;
        }
        if (this.ci.rollup >= 0 && n.roll) {
            const lbl = this.o.rollupLabel || "";
            h += `<span class="hcp-roll" title="${esc((lbl ? lbl + " " : "") + this._num(n.roll))}">${lbl && !inline ? esc(lbl) + " " : ""}<b>${esc(this._num(n.roll, inline))}</b></span>`;
        }
        return h;
    }

    // short = compact notation (2.9M) for the small inline totals
    _num(v, short) {
        try {
            // formatters are expensive to create and every card shows totals: make each once
            const f = (this.numFmt = this.numFmt || {});
            const k = short ? "s" : "l";
            if (!f[k]) {
                f[k] = new Intl.NumberFormat(document.documentElement.lang || undefined,
                    short ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 });
            }
            return f[k].format(v);
        } catch (e) {
            return String(v);
        }
    }

    // One card. Every view shows the title and the team / roll-up totals; the rest follows SLOTS
    // and the card content switches (subtitle, badge, status, totals, body).
    _inner(n) {
        const s = this.style;
        const T = this._cell(n, "title") || (n.virt ? esc(n.vt) : "");
        const S = this._show("subtitle") ? this._cell(n, "subtitle") : "";
        const t = `<div class="hcp-t">${T}</div>`;
        const st = S ? `<div class="hcp-st">${S}</div>` : "";
        const sts = this._show("status") ? this._status(n) : "";
        const stl = sts ? `<div class="hcp-stl">${sts}</div>` : "";
        const bdg = this._show("badge") ? this._badge(n) : "";
        // the totals row, then the footer as a section of its own
        const meta = this._meta(n);
        const foot = this._footer(n);
        const body = this._show("body") ? this._fieldsHtml(n) : "";
        switch (s) {
            case "CLASSIC":
                return `<div class="hcp-card">${bdg}<div class="hcp-tx">${this._icon(n)}${t}${st}${stl}</div>${meta}${foot}</div>`;
            case "DETAILED":
                return `<div class="hcp-card"><div class="hcp-hd">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}${stl}</div>${bdg}</div>` +
                    body + meta + foot + "</div>";
            case "PILL":
                return `<div class="hcp-card">${this._avatar(n, "hcp-av--sm")}<span class="hcp-t">${T}</span>${this._meta(n, true)}${bdg}</div>`;
            case "BUBBLE":
                return `<div class="hcp-card">${this._avatar(n, "hcp-av--xl")}${bdg}${t}${st}${stl}${meta}${foot}</div>`;
            case "HEADER": {
                const c = safeColor(this._v(n, "color"));
                const lum = luminance(c);
                return `<div class="hcp-card"><div class="hcp-band${lum !== null && lum > 0.55 ? " hcp-band--light" : ""}">${t}${bdg}</div>` +
                    `<div class="hcp-body">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${st || (sts ? "" : "&nbsp;")}${stl}</div></div>` +
                    body + meta + foot + "</div>";
            }
            case "MINIMAL":
                return `<div class="hcp-card">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}${stl}${this._meta(n, true)}${foot}</div>${bdg}</div>`;
            case "BADGE": {
                // badges live inside the card: the status first, then every badge value as its own chip
                const chips = sts + (this._show("badge") ? this._badgeChips(n) : "");
                return `<div class="hcp-card"><div class="hcp-hd">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}</div></div>` +
                    (chips ? `<div class="hcp-chips">${chips}</div>` : "") + meta + foot + "</div>";
            }
            case "PHOTO":
                return `<div class="hcp-card"><div class="hcp-ph">${this._avatar(n, "hcp-av--ph")}${bdg}</div>` +
                    `<div class="hcp-tx">${t}${st}${stl}</div>${meta}${foot}</div>`;
            case "CUSTOM":
                return `<div class="hcp-card hcp-custom">${this._template(n)}</div>`;
            default: // AVATAR
                return `<div class="hcp-card">${bdg}${this._avatar(n, "hcp-av--lg")}<div class="hcp-tx">${t}${st}${stl}</div>${meta}${foot}</div>`;
        }
    }

    _template(n) {
        const tokens = {
            ID: () => esc(n.id),
            TITLE: () => this._cell(n, "title") || (n.virt ? esc(n.vt) : ""),
            SUBTITLE: () => (this._show("subtitle") ? this._cell(n, "subtitle") : ""),
            IMAGE: () => this._avatar(n, "hcp-av--md"),
            AVATAR: () => this._avatar(n, "hcp-av--md"),
            ICON: () => this._icon(n),
            BADGE: () => (this._show("badge") ? this._badge(n) : ""),
            BADGES: () => (this._show("badge") ? this._badgeChips(n) : ""),
            STATUS: () => (this._show("status") ? this._status(n) : ""),
            TOTALS: () => this._meta(n),
            FOOTER: () => this._footer(n),
            COLOR: () => esc(safeColor(this._v(n, "color")) || ""),
            FIELDS: () => (this._show("body") ? this._fieldsHtml(n) : ""),
            CHILD_COUNT: () => String(this.kidCount(n)),
            DESC_COUNT: () => String(n.desc || 0),
            ROLLUP: () => esc(this._num(n.roll || 0)),
            LEVEL: () => String((n.depth || 0) + 1)
        };
        return String(this.o.template || "").replace(/&([A-Z0-9_$#]+)\./g, (m, k) => {
            if (tokens[k]) return tokens[k]();
            const i = this.cols.indexOf(k);
            if (i < 0 || !n.r) return i < 0 ? m : "";
            const v = n.r[i];
            return isBlank(v) ? "" : this.rawSet.has(k) ? String(v) : esc(v);
        });
    }

    _nodeHtml(n) {
        if (n.more) {
            return `<div class="hcp-node hcp-morenode" role="treeitem" tabindex="-1" data-id="${esc(n.id)}" style="width:${MORE_WIDTH}px">` +
                `<div class="hcp-card"><span class="hcp-t"></span></div></div>`;
        }
        const color = safeColor(this._v(n, "color"));
        const flag = this._flag(n);
        // hover text is automatic: the full title and subtitle (a pill cuts them short) and the status
        let tip = [this._plain(n, "title"), this._plain(n, "subtitle")].filter(Boolean).join(" – ") + (flag && flag.label ? " · " + flag.label : "");
        const link = !isBlank(this._v(n, "link"));
        // Link Attributes (class, title, data-*, aria-*) go on nodes that have a link
        let extra = "", lcls = "";
        if (link) {
            for (const [k, v] of this.linkAttrs.attrs) {
                if (k === "class") lcls += " " + safeClass(v);
                else if (k === "title") tip = v;
                else if (k !== "rel") extra += ` ${k}="${esc(v)}"`;
            }
        }
        const cls = ["hcp-node", flag ? "hcp-flag" : "", n.virt ? "hcp-virt" : "", link ? "hcp-haslink" : "", lcls].join(" ").replace(/\s+/g, " ").trim();
        let style = `width:${this.nodeW}px;`;
        if (this.o.nodeHeight) style += `height:${+this.o.nodeHeight}px;`;
        if (color) style += `--hcp-accent:${color};`;
        if (flag && flag.color) style += `--hcp-flag:${flag.color};`;
        return `<div class="${cls}" role="treeitem" tabindex="-1" data-id="${esc(n.id)}" style="${style}"${tip ? ` title="${esc(tip)}"` : ""}${extra}>` +
            this._inner(n) + '<span class="hcp-tg" aria-hidden="true"></span></div>';
    }

    _syncNode(n) {
        const el = n.el;
        if (!el) return;
        if (n.more) {
            el.querySelector(".hcp-t").textContent = fmt(this.msg.MORE, n.remaining.toLocaleString());
            el.setAttribute("aria-label", fmt(this.msg.MORE, n.remaining));
            el.setAttribute("aria-level", n.vd + 1);
            return;
        }
        const has = this.hasKids(n);
        const tg = el.querySelector(".hcp-tg");
        el.classList.toggle("hcp-parent", has);
        el.classList.toggle("hcp-open", has && n.exp);
        if (has) {
            el.setAttribute("aria-expanded", n.exp ? "true" : "false");
            const c = this.kidCount(n);
            tg.textContent = n.exp ? "−" : "+" + (c > 999 ? Math.round(c / 100) / 10 + "k" : c);
            tg.title = (n.exp ? this.msg.COLLAPSE : this.msg.EXPAND) + " – " + fmt(this.msg.TEAM, c, n.desc || c);
            // a closed branch tells how many highlighted people are inside it
            if (!n.exp && n.hlc > 0) {
                const b = document.createElement("b");
                b.className = "hcp-tgh";
                b.textContent = n.hlc > 999 ? Math.round(n.hlc / 100) / 10 + "k" : n.hlc;
                tg.appendChild(b);
                tg.title += " – " + fmt(this.msg.HL_BRANCH, n.hlc);
            }
        } else el.removeAttribute("aria-expanded");
        el.classList.toggle("hcp-loading", !!n.loading);
        el.setAttribute("aria-level", n.vd + 1);
        const label = [this._plain(n, "title") || n.vt, this._plain(n, "subtitle")].filter(Boolean).join(", ");
        el.setAttribute("aria-label", label);
        el.setAttribute("aria-selected", this.sel === n ? "true" : "false");
        el.classList.toggle("hcp-sel", this.sel === n);
    }

    get nodeW() {
        return +this.o.nodeWidth || STYLE_WIDTH[this.style] || 210;
    }

    /* ---------------- render pipeline ---------------- */

    _measureVp() {
        this.vw = this.vp.clientWidth;
        this.vh = this.vp.clientHeight;
    }

    _render(isData) {
        this._measureVp();
        if (!this.vw || !this.vh) {
            this.pending = true; // hidden (collapsed region / inactive tab) - render once visible
            return;
        }
        this.pending = false;
        if (!this.nodes.size) {
            this._clearDom();
            this._showMsg(this.o.noDataMessage || this.msg.NO_DATA);
            this._legend();
            return;
        }
        this.msgEl.hidden = true;
        this.update({ animate: !isData || !!this.didRender });
        if (isData) {
            this._syncSwitches();
            this._cfgSync();
            // the legend first, so the first fit leaves room for it
            this._legend();
            if (!this.didRender) {
                this.didRender = true;
                this._initialView();
            }
            if (this.qEl && this.qEl.value) this.search(this.qEl.value, true);
            this._fire("after_render", { nodeCount: this.nodes.size, visibleCount: this.V.length });
        }
    }

    _clearDom() {
        this.layer.textContent = "";
        this.gLinks.textContent = "";
        this.gPanels.textContent = "";
        this.gBands.textContent = "";
        this.linkEls.clear();
        this.panelEls.clear();
        for (const n of this.nodes.values()) { n.el = null; n.cur = null; }
        for (const m of this.moreNodes.values()) { m.el = null; m.cur = null; }
        this.V = [];
    }

    _showMsg(text, detail) {
        this.msgEl.hidden = false;
        this.msgEl.innerHTML = `<div class="hcp-msg-in">${detail ? icon("warn") : ""}<p>${esc(text)}</p>${detail && this._debug() ? `<pre>${esc(detail).slice(0, 2000)}</pre>` : ""}</div>`;
    }

    _debug() {
        return !!(window.apex && apex.debug && apex.debug.getLevel && apex.debug.getLevel() > 0) || !!this.o.dataProvider;
    }

    /**
     * Re-layout and re-draw. opts.anchor keeps that node visually still.
     */
    update(opts) {
        opts = opts || {};
        if (this.anim) this._finishAnim();
        const prevV = this.V;
        const V = (this.V = this._visible());
        const inV = new Set(V);

        // create elements for new nodes
        let html = "";
        const fresh = [];
        for (const n of V) {
            if (!n.el) {
                html += this._nodeHtml(n);
                fresh.push(n);
            }
        }
        if (fresh.length) {
            const tpl = document.createElement("template");
            tpl.innerHTML = html;
            const els = Array.from(tpl.content.children);
            els.forEach((e, i) => {
                const n = fresh[i];
                n.el = e;
                e._hcp = n;
                e.classList.add("hcp-enter");
                n.w = n.h = null;
            });
            this.layer.appendChild(tpl.content);
        }
        for (const n of V) {
            if (n.el.style.display === "none") { n.el.style.display = ""; n.culled = false; }
            this._syncNode(n);
        }
        // measure (one forced reflow for all new nodes)
        for (const n of V) {
            if (n.w === null || n.w === undefined) {
                n.w = n.el.offsetWidth;
                n.h = n.el.offsetHeight;
            }
        }
        // keep the anchor where it was
        const anchor = opts.anchor && opts.anchor.cur ? { n: opts.anchor, x: opts.anchor.cur.x, y: opts.anchor.cur.y } : null;
        this._layout(V);
        if (anchor && anchor.n.box) {
            const dx = anchor.x - anchor.n.box.x, dy = anchor.y - anchor.n.box.y;
            for (const n of V) { n.box.x += dx; n.box.y += dy; }
            this.L.shift = { dx, dy };
        } else this.L.shift = null;
        this._bounds(V);

        // leaving nodes
        const exiting = prevV.filter(n => !inV.has(n) && n.el);
        // links: one per visible non-root node
        for (const n of V) {
            if (n.vp && !this.linkEls.has(n.id)) {
                const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
                p.setAttribute("class", "hcp-lk");
                this.gLinks.appendChild(p);
                this.linkEls.set(n.id, p);
            }
        }
        // starting positions for new nodes: from their parent's current spot
        for (const n of fresh) {
            const p = n.vp;
            if (n.keep) n.cur = n.keep;
            else if (p && p.cur && opts.animate !== false) {
                n.cur = { x: p.cur.x + (p.w - n.w) / 2, y: p.cur.y + (p.h - n.h) / 2 };
            } else n.cur = null;
        }
        const dur = this._duration(opts, V.length + exiting.length);
        requestAnimationFrame(() => fresh.forEach(n => n.el && n.el.classList.remove("hcp-enter")));
        this._animate(V, exiting, dur, () => {
            this._bands();
            this._aria(V);
            this._cull();
            this._drawMini();
            this._applyMarks();
        });
        if (opts.fit) this.fit(0);
        this._crumbs();
    }

    _duration(opts, count) {
        if (opts.animate === false || !this.o.animate || count > 1800) return 0;
        if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
        return this.o.duration;
    }

    _aria(V) {
        for (const n of V) {
            const sib = n.vp ? n.vp.shown : V.filter(x => x.vd === 0);
            n.el.setAttribute("aria-setsize", sib.length);
            n.el.setAttribute("aria-posinset", sib.indexOf(n) + 1);
        }
        // roving tabindex
        const f = (this.focusId && this._get(this.focusId)) || this.sel || V[0];
        V.forEach(n => (n.el.tabIndex = n === f ? 0 : -1));
        if (f && !V.includes(f) && V[0]) V[0].el.tabIndex = 0;
    }

    _get(id) {
        if (id === null || id === undefined) return null;
        id = String(id);
        return this.nodes.get(id) || (id.indexOf("\u0001more:") === 0 ? this.moreNodes.get(id.slice(6)) : null);
    }

    _byEl(el) {
        return el && el._hcp ? el._hcp : null;
    }

    /* ---------------- layout ---------------- */

    _layout(V) {
        if (this.eo === "RADIAL") return this._layoutRadial(V);
        const o = this.o;
        const horiz = this.eo === "LR" || this.eo === "RL";
        const B = n => (horiz ? n.h : n.w);
        const D = n => (horiz ? n.w : n.h);
        const gap = +o.siblingGap || 0;
        const lg = +o.levelGap || 0;

        for (const n of V) n.grp = null;
        for (const n of V) if (n.shown.length) n.grp = this._groupMode(n, horiz);

        const layer = [];
        for (const n of V) {
            const s = D(n);
            if (!(layer[n.vd] >= s)) layer[n.vd] = s;
        }
        const dpos = [0];
        for (let i = 1; i <= layer.length; i++) dpos[i] = dpos[i - 1] + (layer[i - 1] || 0) + lg;
        const layerAt = y => {
            let i = 0;
            while (i + 1 < dpos.length && dpos[i + 1] - lg / 2 <= y) i++;
            return i;
        };

        // post-order: children before parents
        for (let i = V.length - 1; i >= 0; i--) {
            const n = V[i];
            const b = B(n);
            const cont = [[-b / 2, b / 2]];
            n.ty = dpos[n.vd];
            const kids = n.shown;
            if (kids.length) {
                if (n.grp) {
                    const ext = this._groupLayout(n, kids, dpos, B, D, gap);
                    const last = layerAt(n.gbox.y1);
                    for (let L = n.vd + 1; L <= Math.max(last, n.vd + 1); L++) cont[L - n.vd] = [ext[0], ext[1]];
                } else {
                    const { offs, acc } = pack(kids.map(k => k.cont), gap);
                    const c = (offs[0] + offs[offs.length - 1]) / 2;
                    kids.forEach((k, j) => (k.rx = offs[j] - c));
                    acc.forEach((s, k) => (cont[k + 1] = [s[0] - c, s[1] - c]));
                }
            }
            n.cont = cont;
        }
        const roots = V.filter(n => n.vd === 0);
        const { offs } = pack(roots.map(r => r.cont), gap * 2);
        roots.forEach((r, j) => (r.ax = offs[j]));
        for (const n of V) if (n.vp) n.ax = n.vp.ax + n.rx;

        const mir = this.rtl && !horiz ? -1 : 1;
        for (const n of V) {
            const ax = n.ax * mir;
            let x, y;
            switch (this.eo) {
                case "BT": x = ax - n.w / 2; y = -(n.ty + n.h); break;
                case "LR": x = n.ty; y = ax - n.h / 2; break;
                case "RL": x = -(n.ty + n.w); y = ax - n.h / 2; break;
                default: x = ax - n.w / 2; y = n.ty;
            }
            n.box = { x, y };
        }
        this.L = { dpos, layer, horiz, lg };
    }

    _groupMode(n, horiz) {
        const kids = n.shown;
        if (kids.length < 2) return null;
        // "highlighted only" shows filtered branches, so a leaf is a node with nothing shown below it
        for (const k of kids) if (this.onlyHl ? k.shown && k.shown.length : this.hasKids(k)) return null;
        const m = this.o.leafLayout;
        if (m === "ROW") return null;
        // sideways a team is already a column: only big teams become a grid
        if (horiz) return (m === "AUTO" ? kids.length > 8 : kids.length > 3) ? "grid" : null;
        if (m === "STACK") return "stack";
        if (m === "GRID") return kids.length > 3 ? "grid" : "stack";
        return kids.length <= 3 ? null : kids.length <= 8 ? "stack" : "grid";
    }

    // Places leaf children of n as a two-sided stack or a grid panel.
    // Returns breadth extents relative to n; sets kid.rx / kid.ty and n.gbox.
    _groupLayout(n, kids, dpos, B, D, gap) {
        const y0 = dpos[n.vd + 1];
        if (n.grp === "stack") {
            const sp = Math.max(16, gap * 0.75);
            const vg = Math.max(10, gap * 0.5);
            let y = y0, mL = 0, mR = 0;
            for (let i = 0; i < kids.length; i += 2) {
                const a = kids[i], b = kids[i + 1];
                const h = Math.max(D(a), b ? D(b) : 0);
                a.rx = -(sp + B(a) / 2); a.ty = y; mL = Math.max(mL, B(a));
                if (b) { b.rx = sp + B(b) / 2; b.ty = y; mR = Math.max(mR, B(b)); }
                y += h + vg;
            }
            n.gbox = { kind: "stack", y0, y1: y - vg };
            return [-(sp + mL), sp + mR];
        }
        const cnt = kids.length;
        const cols = Math.min(cnt, Math.max(2, Math.round(Math.sqrt(cnt * 1.6))));
        const cw = Math.max(...kids.map(B));
        const gx = Math.max(10, gap * 0.5), pad = 14;
        const W = cols * cw + (cols - 1) * gx + 2 * pad;
        let y = y0 + pad;
        for (let r = 0; r * cols < cnt; r++) {
            const row = kids.slice(r * cols, r * cols + cols);
            const h = Math.max(...row.map(D));
            row.forEach((k, c) => {
                k.rx = -W / 2 + pad + c * (cw + gx) + cw / 2;
                k.ty = y;
            });
            y += h + gx;
        }
        n.gbox = { kind: "grid", y0, y1: y - gx + pad, w: W };
        return [-W / 2, W / 2];
    }

    _layoutRadial(V) {
        const o = this.o;
        const roots = V.filter(n => n.vd === 0);
        const single = roots.length === 1;
        const vroot = { __v: true, shown: roots };
        const h = d3hierarchy(vroot, d => (d.shown && d.shown.length ? d.shown : null));
        d3tree().size([2 * Math.PI, 1]).separation((a, b) => (a.parent === b.parent ? 1 : 1.6) / Math.max(1, a.depth))(h);
        const maxS = Math.max(...V.map(n => Math.max(n.w, n.h)));
        const ang = [];
        h.each(d => {
            if (d.data.__v) return;
            const k = d.depth - (single ? 1 : 0);
            (ang[k] = ang[k] || []).push(d.x);
        });
        // each ring must be big enough that its two closest neighbours don't touch
        const r = [0];
        for (let d = 1; d < ang.length; d++) {
            const a = (ang[d] || []).slice().sort((x, y) => x - y);
            let minGap = 2 * Math.PI;
            for (let i = 1; i < a.length; i++) minGap = Math.min(minGap, a[i] - a[i - 1]);
            if (a.length > 1) minGap = Math.min(minGap, 2 * Math.PI - a[a.length - 1] + a[0]);
            const need = a.length > 1 ? (maxS + (+o.siblingGap || 0)) / Math.max(minGap, 1e-3) : 0;
            r[d] = Math.max(r[d - 1] + maxS + (+o.levelGap || 40) * 0.6, need);
        }
        const mir = this.rtl ? -1 : 1;
        h.each(d => {
            if (d.data.__v) return;
            const n = d.data;
            const k = d.depth - (single ? 1 : 0);
            const rr = r[k] || 0;
            const th = d.x;
            const cx = mir * rr * Math.sin(th), cy = -rr * Math.cos(th);
            n.box = { x: cx - n.w / 2, y: cy - n.h / 2 };
            n.grp = null;
        });
        this.L = { radial: true, lg: +o.levelGap || 40 };
    }

    _bounds(V) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const n of V) {
            const b = n.box;
            if (b.x < x0) x0 = b.x;
            if (b.y < y0) y0 = b.y;
            if (b.x + n.w > x1) x1 = b.x + n.w;
            if (b.y + n.h > y1) y1 = b.y + n.h;
        }
        const m = 14;
        this.bounds = { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m };
        if (this._bandsOn() && !this.L.radial) {
            // room for the band labels at the start edge
            if (this.L.horiz) this.bounds.y0 -= 30;
            else if (this.rtl) this.bounds.x1 += 110;
            else this.bounds.x0 -= 110;
        }
    }

    /* ---------------- links ---------------- */

    _P(a, b, horiz) {
        return horiz ? r1(a) + "," + r1(b) : r1(b) + "," + r1(a);
    }

    _linkPath(p, c) {
        const st = this.o.connector;
        const pc = p.cur, cc = c.cur;
        if (!pc || !cc) return "";
        if (this.L.radial) return this._radialPath(p, c);
        const horiz = this.L.horiz;
        const s = this.eo === "TB" || this.eo === "LR" ? 1 : -1;
        const P = (a, b) => this._P(a, b, horiz);
        const pa = horiz ? (s > 0 ? pc.x + p.w : pc.x) : (s > 0 ? pc.y + p.h : pc.y);
        const pb = horiz ? pc.y + p.h / 2 : pc.x + p.w / 2;
        const rad = st === "ROUNDED" ? 10 : st === "ELBOW" ? 0 : -1;

        if (p.grp === "stack") {
            const ia = cc.y + c.h / 2;
            const left = cc.x + c.w / 2 < pb;
            const e = left ? cc.x + c.w : cc.x;
            return elbow2(pa, pb, ia, e, Math.max(rad, 0), P);
        }
        if (p.grp === "grid") {
            if (p.shown[0] !== c) return "";
            const pr = this._panelRect(p);
            const top = horiz ? (s > 0 ? pr.x : pr.x + pr.w) : (s > 0 ? pr.y : pr.y + pr.h);
            return "M" + P(pa, pb) + "L" + P(top, pb);
        }
        const ca = horiz ? (s > 0 ? cc.x : cc.x + c.w) : (s > 0 ? cc.y : cc.y + c.h);
        const cb = horiz ? cc.y + c.h / 2 : cc.x + c.w / 2;
        if (st === "STRAIGHT") return "M" + P(pa, pb) + "L" + P(ca, cb);
        if (st === "CURVED") {
            const m = (pa + ca) / 2;
            return "M" + P(pa, pb) + "C" + P(m, pb) + " " + P(m, cb) + " " + P(ca, cb);
        }
        const m = ca - s * this.L.lg / 2;
        return elbow3(pa, pb, m, ca, cb, rad, P);
    }

    _radialPath(p, c) {
        const st = this.o.connector;
        const a = { x: p.cur.x + p.w / 2, y: p.cur.y + p.h / 2 };
        const b = { x: c.cur.x + c.w / 2, y: c.cur.y + c.h / 2 };
        const pt = v => r1(v.x) + "," + r1(v.y);
        if (st === "STRAIGHT") return "M" + pt(a) + "L" + pt(b);
        // radial trees always use a smooth radial bezier (elbows read badly on a circle)
        const ra = Math.hypot(a.x, a.y), rb = Math.hypot(b.x, b.y);
        if (ra < 1) return "M" + pt(a) + "L" + pt(b);
        const ta = Math.atan2(a.x, -a.y), tb = Math.atan2(b.x, -b.y);
        const rm = (ra + rb) / 2;
        const pol = (t, r) => ({ x: r * Math.sin(t), y: -r * Math.cos(t) });
        return "M" + pt(a) + "C" + pt(pol(ta, rm)) + " " + pt(pol(tb, rm)) + " " + pt(b);
    }

    _panelRect(p) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const k of p.shown) {
            const c = k.cur;
            if (!c) continue;
            x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y);
            x1 = Math.max(x1, c.x + k.w); y1 = Math.max(y1, c.y + k.h);
        }
        const pad = 14;
        return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    }

    _drawLinks() {
        for (const [id, el] of this.linkEls) {
            const c = this._get(id);
            const p = c && (c.vp || c.parent);
            el.setAttribute("d", c && p && c.el ? this._linkPath(p, c) : "");
        }
        // grid panels
        const want = new Set();
        for (const n of this.V) {
            if (n.grp !== "grid") continue;
            want.add(n.id);
            let r = this.panelEls.get(n.id);
            if (!r) {
                r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                r.setAttribute("class", "hcp-panel");
                r.setAttribute("rx", 14);
                this.gPanels.appendChild(r);
                this.panelEls.set(n.id, r);
            }
            const pr = this._panelRect(n);
            r.setAttribute("x", r1(pr.x)); r.setAttribute("y", r1(pr.y));
            r.setAttribute("width", r1(Math.max(0, pr.w))); r.setAttribute("height", r1(Math.max(0, pr.h)));
        }
        for (const [id, r] of this.panelEls) if (!want.has(id)) { r.remove(); this.panelEls.delete(id); }
    }

    /* ---------------- animation ---------------- */

    _animate(V, exiting, dur, done) {
        const movers = [];
        const tx = (el, x, y) => (el.style.transform = `translate(${r1(x)}px,${r1(y)}px)`);
        for (const n of V) {
            if (!n.cur) n.cur = { x: n.box.x, y: n.box.y };
            movers.push({ n, fx: n.cur.x, fy: n.cur.y, tx: n.box.x, ty: n.box.y });
        }
        for (const n of exiting) {
            let anc = n.vp;
            while (anc && !V.includes(anc)) anc = anc.vp;
            const t = anc ? { x: anc.box.x + (anc.w - n.w) / 2, y: anc.box.y + (anc.h - n.h) / 2 } : n.cur;
            n.el.classList.add("hcp-exit");
            if (n.cur) movers.push({ n, fx: n.cur.x, fy: n.cur.y, tx: t.x, ty: t.y, exit: true });
        }
        const finish = () => {
            for (const m of movers) {
                m.n.cur = { x: m.tx, y: m.ty };
                if (m.exit) {
                    if (m.n.el) m.n.el.remove();
                    m.n.el = null;
                    m.n.cur = null;
                    const l = this.linkEls.get(m.n.id);
                    if (l) { l.remove(); this.linkEls.delete(m.n.id); }
                } else if (m.n.el) tx(m.n.el, m.tx, m.ty);
            }
            // links of nodes that are neither visible nor exiting (e.g. re-rooted)
            const vis = new Set(V.map(n => n.id));
            for (const [id, l] of this.linkEls) if (!vis.has(id)) { l.remove(); this.linkEls.delete(id); }
            this.anim = null;
            this._drawLinks();
            done && done();
        };
        if (!dur) {
            this.anim = { finish };
            return this._finishAnim();
        }
        const t0 = performance.now();
        const frame = now => {
            if (!this.anim || this.anim.id !== id) return;
            const e = Math.min(1, (now - t0) / dur);
            const k = easeInOut(e);
            for (const m of movers) {
                const x = m.fx + (m.tx - m.fx) * k, y = m.fy + (m.ty - m.fy) * k;
                m.n.cur = { x, y };
                if (m.n.el) tx(m.n.el, x, y);
            }
            this._drawLinks();
            if (e < 1) this.anim.raf = requestAnimationFrame(frame);
            else finish();
        };
        const id = {};
        this.anim = { id, finish, raf: requestAnimationFrame(frame) };
    }

    _finishAnim() {
        const a = this.anim;
        if (!a) return;
        if (a.raf) cancelAnimationFrame(a.raf);
        a.finish();
    }

    /* ---------------- bands / legend / minimap ---------------- */

    _bandsOn() {
        return !!this.o.levelBands || this.ci.levelName >= 0;
    }

    _bands() {
        const g = this.gBands;
        g.textContent = "";
        if (!this._bandsOn() || !this.L || this.L.radial) {
            this.bandList = null;
            return this._placeBands();
        }
        const { dpos, layer, horiz, lg } = this.L;
        const sh = this.L.shift || { dx: 0, dy: 0 };
        const b = this.bounds;
        const s = this.eo === "TB" || this.eo === "LR" ? 1 : -1;
        const labels = [];
        // band names come from the Level Name Column (the first value found on each level)
        for (const n of this.V) if (!labels[n.vd]) labels[n.vd] = this._plain(n, "levelName");
        let h = "";
        const list = [];
        for (let i = 0; i < layer.length; i++) {
            const a0 = dpos[i] - lg / 2, a1 = dpos[i] + layer[i] + lg / 2;
            const size = a1 - a0;
            const at = (s > 0 ? a0 : -a1) + (horiz ? sh.dx : sh.dy);
            list.push({ at, size, label: labels[i] || fmt(this.msg.LEVEL, i + 1) });
            h += horiz
                ? `<rect class="hcp-band hcp-band--${i % 2}" x="${r1(at)}" y="${r1(b.y0)}" width="${r1(size)}" height="${r1(b.y1 - b.y0)}"/>`
                : `<rect class="hcp-band hcp-band--${i % 2}" x="${r1(b.x0)}" y="${r1(at)}" width="${r1(b.x1 - b.x0)}" height="${r1(size)}"/>`;
        }
        g.innerHTML = h;
        this.bandList = list;
        // labels live in an overlay pinned to the viewport edge, so they stay readable while panning
        let ov = this.vp.querySelector(".hcp-blabels");
        if (!ov) {
            ov = document.createElement("div");
            ov.className = "hcp-blabels";
            ov.setAttribute("aria-hidden", "true");
            this.vp.insertBefore(ov, this.legendEl);
        }
        ov.innerHTML = list.map(x => `<span class="hcp-bl">${esc(x.label)}</span>`).join("");
        this._placeBands();
    }

    _placeBands() {
        const ov = this.vp.querySelector(".hcp-blabels");
        if (!ov) return;
        const on = this._bandsOn() && this.L && !this.L.radial && this.bandList;
        ov.hidden = !on;
        if (!on) return;
        const t = this.t;
        const horiz = this.L.horiz;
        ov.classList.toggle("hcp-blabels--h", horiz);
        Array.from(ov.children).forEach((el, i) => {
            const b = this.bandList[i];
            if (!b) return;
            if (horiz) {
                el.style.transform = `translate(${r1((b.at + b.size / 2) * t.k + t.x)}px,0) translateX(-50%)`;
                el.classList.add("hcp-bl--top");
            } else {
                el.style.top = r1(b.at * t.k + t.y + 6) + "px";
                el.classList.remove("hcp-bl--top");
            }
        });
    }

    _legend() {
        const lg = this.legendMap;
        const sm = this.statusMap;
        const el = this.legendEl;
        if (!this.o.legend || ((!lg || !lg.size) && (!sm || !sm.size))) {
            el.hidden = true;
            return;
        }
        let h = "";
        // statuses first (with their count): click one to pick out those people
        for (const [l, s] of sm || []) {
            h += `<button type="button" class="hcp-lg-i hcp-lg-st${this.stFilter === l ? " is-on" : ""}" data-st="${esc(l)}" aria-pressed="${this.stFilter === l}"` +
                ` style="--hcp-flag:${s.color || "var(--hcp-flag)"}"><span class="hcp-sw hcp-sw--ring"></span>${esc(l)}<b>${s.count.toLocaleString()}</b></button>`;
        }
        for (const [l, c] of lg || []) {
            h += `<button type="button" class="hcp-lg-i${this.lgFilter === l ? " is-on" : ""}" data-lg="${esc(l)}" aria-pressed="${this.lgFilter === l}">` +
                `<span class="hcp-sw" style="${c ? "background:" + c : ""}"></span>${esc(l)}</button>`;
        }
        el.innerHTML = h;
        el.hidden = false;
    }

    _legendFilter(v) {
        this.lgFilter = v;
        this._legend();
        this._applyMarks();
    }

    // picks out one status: dims everyone else, or with "highlighted only" shows only them
    statusFilter(v) {
        this.stFilter = isBlank(v) ? null : String(v);
        this._legend();
        if (this.onlyHl) {
            this.update({ animate: true });
            this.fit();
        } else this._applyMarks();
    }

    _drawMini() {
        const show = !!this.o.miniMap && this.V.length > 1;
        this.mini.hidden = !show;
        if (!show) return (this.miniMap = null);
        const dpr = window.devicePixelRatio || 1;
        const W = 180, H = 120;
        const cv = this.mini;
        if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
        const ctx = cv.getContext("2d");
        const b = this.bounds;
        const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
        const s = Math.min((W - 12) / bw, (H - 12) / bh);
        const ox = (W - bw * s) / 2 - b.x0 * s, oy = (H - bh * s) / 2 - b.y0 * s;
        this.miniMap = { toWorld: (x, y) => ({ x: (x - ox) / s, y: (y - oy) / s }) };
        const css = getComputedStyle(this.el);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = css.getPropertyValue("--hcp-mini-node").trim() || "#94a3b8";
        for (const n of this.V) {
            const x = n.box.x * s + ox, y = n.box.y * s + oy;
            ctx.fillRect(x, y, Math.max(1.5, n.w * s), Math.max(1.5, n.h * s));
        }
        ctx.fillStyle = css.getPropertyValue("--hcp-hl").trim() || "#2563eb";
        for (const n of this.V) {
            if (!n.el || !n.el.classList.contains("hcp-flag")) continue;
            ctx.fillRect(n.box.x * s + ox, n.box.y * s + oy, Math.max(2, n.w * s), Math.max(2, n.h * s));
        }
        const t = this.t;
        ctx.strokeStyle = css.getPropertyValue("--hcp-primary").trim() || "#2563eb";
        ctx.lineWidth = 1.5;
        ctx.strokeRect((-t.x / t.k) * s + ox, (-t.y / t.k) * s + oy, (this.vw / t.k) * s, (this.vh / t.k) * s);
    }

    /* ---------------- zoom / view ---------------- */

    _applyTransform() {
        const t = this.t;
        this.stage.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.k})`;
        if (this.bandList) this._placeBands();
        if (!this.miniRaf) {
            this.miniRaf = requestAnimationFrame(() => {
                this.miniRaf = null;
                this._drawMini();
            });
        }
    }

    _setTransform(t, dur) {
        if (dur === undefined) dur = this._duration({}, 0) ? 450 : 0;
        if (dur) this.vpSel.transition().duration(dur).call(this.zoom.transform, t);
        else this.vpSel.call(this.zoom.transform, t);
    }

    zoomBy(f) {
        if (this._duration({}, 0)) this.vpSel.transition().duration(250).call(this.zoom.scaleBy, f);
        else this.vpSel.call(this.zoom.scaleBy, f);
    }

    fit(dur) {
        this._measureVp();
        const b = this.bounds;
        if (!b || !this.vw) return;
        const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
        const pad = 24;
        // keep the legend row (bottom, or top for bottom-up charts) clear of the cards
        const lg = this.legendEl.hidden ? 0 : this.legendEl.offsetHeight + 12;
        const top = pad + (this.eo === "BT" ? lg : 0), bottom = pad + (this.eo === "BT" ? 0 : lg);
        const h = this.vh - top - bottom;
        let k = Math.min((this.vw - pad * 2) / bw, h / bh, 1);
        k = Math.max(this.o.minZoom, k);
        const x = (this.vw - bw * k) / 2 - b.x0 * k;
        let y = top + (h - bh * k) / 2 - b.y0 * k;
        if (this.eo === "TB" && bh * k < h) y = top + 8 - b.y0 * k;
        this._setTransform(zoomIdentity.translate(x, y).scale(k), dur);
    }

    reset() {
        this.viewRoot = null;
        this.clearHighlight();
        this.clearPath();
        this.update({ animate: true });
        this._initialView(true);
    }

    _initialView(force) {
        const o = this.o;
        if (o.initialView === "HIGHLIGHT") {
            const f = this.order.find(n => this._flag(n));
            if (f) return this.focusNode(f.id);
        }
        const dur = force ? undefined : 0;
        const root = this.V.find(n => n.vd === 0);
        if (o.initialView === "ROOT" && root) return this.centerOn(root, 1, dur, true);
        // FIT, but never so small that the cards are unreadable: then start at the root
        if (root && this.eo !== "RADIAL" && this._fitK() < 0.55) return this.centerOn(root, 0.8, dur, true);
        this.fit(dur);
    }

    _fitK() {
        const b = this.bounds;
        if (!b || !this.vw) return 1;
        return Math.min((this.vw - 48) / (b.x1 - b.x0), (this.vh - 48) / (b.y1 - b.y0), 1);
    }

    // edge = true puts the node near the side the tree grows from (top for TB, left for LR, ...)
    centerOn(n, k, dur, edge) {
        if (!n || !n.box) return;
        this._measureVp();
        k = k || Math.max(this.t.k, 0.85);
        k = Math.min(Math.max(k, this.o.minZoom), this.o.maxZoom);
        const cx = n.box.x + n.w / 2, cy = n.box.y + n.h / 2;
        let x = this.vw / 2 - cx * k, y = this.vh / 2 - cy * k;
        if (edge) {
            const m = 40;
            if (this.eo === "TB") y = m - n.box.y * k;
            else if (this.eo === "BT") y = this.vh - m - (n.box.y + n.h) * k;
            else if (this.eo === "LR") x = m - n.box.x * k;
            else if (this.eo === "RL") x = this.vw - m - (n.box.x + n.w) * k;
            // sideways trees: rather than cut the top rows (under the band labels), start at the
            // top edge when the root still fits on screen
            const b = this.bounds;
            if ((this.eo === "LR" || this.eo === "RL") && b) {
                const yt = 8 - b.y0 * k;
                if (y < yt && (n.box.y + n.h) * k + yt <= this.vh - 24) y = yt;
            }
        }
        this._setTransform(zoomIdentity.translate(x, y).scale(k), dur);
    }

    _ensureVisible(n) {
        if (!n.box) return;
        const t = this.t;
        const x = n.box.x * t.k + t.x, y = n.box.y * t.k + t.y;
        const w = n.w * t.k, h = n.h * t.k;
        const m = 24;
        if (x < m || y < m || x + w > this.vw - m || y + h > this.vh - m) this.centerOn(n, t.k, 300);
    }

    // hide far-away nodes on big charts (layout & links stay intact)
    _cull() {
        if (this.anim) return;
        const V = this.V;
        if (V.length < 300) {
            for (const n of V) if (n.culled) { n.el.style.display = ""; n.culled = false; }
            return;
        }
        const t = this.t;
        const m = 300 / t.k;
        const x0 = -t.x / t.k - m, y0 = -t.y / t.k - m;
        const x1 = x0 + this.vw / t.k + 2 * m, y1 = y0 + this.vh / t.k + 2 * m;
        for (const n of V) {
            const b = n.box;
            const out = b.x > x1 || b.y > y1 || b.x + n.w < x0 || b.y + n.h < y0;
            if (out !== !!n.culled) {
                n.culled = out;
                n.el.style.display = out ? "none" : "";
            }
        }
    }

    /* ---------------- expand / collapse ---------------- */

    toggle(id) {
        const n = this._get(id);
        if (!n || !this.hasKids(n)) return Promise.resolve();
        return n.exp ? this.collapse(n.id) : this.expand(n.id);
    }

    expand(id, opts) {
        const n = this._get(id);
        if (!n || !this.hasKids(n)) return Promise.resolve();
        const go = () => {
            n.exp = true;
            this._save();
            if (!opts || opts.update !== false) this.update({ anchor: n });
            this._fire("expand", this._eventData(n));
        };
        if (this.lazy && !n.loaded) return this._loadChildren([n]).then(go);
        go();
        return Promise.resolve();
    }

    collapse(id) {
        const n = this._get(id);
        if (!n || !n.exp) return;
        n.exp = false;
        n.lim = this.o.maxChildren;
        this._save();
        this.update({ anchor: n });
        this._fire("collapse", this._eventData(n));
    }

    expandAll() {
        for (const n of this.nodes.values()) if (n.kids.length) n.exp = true;
        this._save();
        this.update({ animate: this.nodes.size < 600 });
        this.fit();
    }

    collapseAll() {
        for (const n of this.nodes.values()) { n.exp = false; n.lim = this.o.maxChildren; }
        const base = this.viewRoot ? [this.viewRoot] : this.roots;
        if (base.length === 1) base[0].exp = true;
        this._save();
        this.update({ animate: true });
        this.fit();
    }

    expandBranch(id, open) {
        const n = this._get(id);
        if (!n) return;
        const st = [n];
        while (st.length) {
            const c = st.pop();
            if (c.kids.length) c.exp = open;
            if (!open) c.lim = this.o.maxChildren;
            c.kids.forEach(k => st.push(k));
        }
        if (open && this.lazy && !n.loaded) return this.expand(n.id);
        this._save();
        this.update({ anchor: n });
        this._fire(open ? "expand" : "collapse", this._eventData(n));
    }

    _showMore(p) {
        p.lim += this.o.maxChildren;
        const m = this.moreNodes.get(p.id);
        this.update({ anchor: m && m.cur ? m : p });
    }

    // Makes sure the node exists (lazy) and every ancestor is open; resolves to the node.
    expandTo(id) {
        id = String(id);
        const ready = this.nodes.has(id) || !this.lazy ? Promise.resolve() : this._loadPath([id]);
        return ready.then(() => {
            const n = this.nodes.get(id);
            if (!n) return null;
            if (this.viewRoot && !this._isUnder(n, this.viewRoot)) this.viewRoot = null;
            const chain = [];
            for (let c = n.parent; c; c = c.parent) chain.unshift(c);
            const loads = chain.filter(c => this.lazy && !c.loaded);
            const next = loads.length ? this._loadChildren(loads) : Promise.resolve();
            return next.then(() => {
                let child = n;
                for (let c = n.parent; c; c = c.parent) {
                    c.exp = true;
                    const i = c.kids.indexOf(child);
                    if (i >= c.lim) c.lim = Math.ceil((i + 1) / this.o.maxChildren) * this.o.maxChildren;
                    child = c;
                }
                this._save();
                return n;
            });
        });
    }

    _isUnder(n, a) {
        for (let c = n; c; c = c.parent) if (c === a) return true;
        return false;
    }

    /* ---------------- lazy loading ---------------- */

    _loadChildren(list) {
        list = list.filter(n => !n.loaded && !n.loading);
        if (!list.length) return Promise.resolve();
        list.forEach(n => { n.loading = true; this._syncNode(n); });
        return this._request({ x01: "CHILDREN", f01: list.map(n => n.id) })
            .then(res => {
                if (res && res.error) throw new Error(res.error);
                this._ingest(res, "merge");
                // a child that arrived earlier (search / path) must take its query position
                const pos = new Map();
                (res.rows || []).forEach((r, i) => pos.set(String(r[this.ci.id]), i));
                list.forEach(n => {
                    n.loaded = true;
                    n.loading = false;
                    n.kids.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : 1e9) - (pos.has(b.id) ? pos.get(b.id) : 1e9) || a.seq - b.seq);
                    n.cc = n.kids.length;
                });
                // nodes delivered by this call are not loaded yet
                (res.rows || []).forEach(r => {
                    const c = this.nodes.get(String(r[this.ci.id]));
                    if (c && !list.includes(c) && !c.kids.length) c.loaded = c.cc === 0;
                });
                this._derive();
            })
            .catch(err => {
                list.forEach(n => { n.loading = false; this._syncNode(n); });
                this._showToast(this.msg.ERROR);
                if (window.console) console.error("Hierarchy Pro:", err);
                throw err;
            });
    }

    _loadPath(ids) {
        return this._request({ x01: "PATH", f01: ids }).then(res => {
            if (res && res.error) throw new Error(res.error);
            this._ingest(res, "merge");
            this._derive();
        });
    }

    _showToast(text) {
        this._showMsg(text, null);
        setTimeout(() => (this.msgEl.hidden = true), 2500);
    }

    /* ---------------- click / navigation ---------------- */

    _click(n, ev) {
        const o = this.o;
        this.select(n.id, true);
        if (o.highlightPath === "CLICK") this.setPath(n.id);
        this._fire("node_click", this._eventData(n));
        const link = this._v(n, "link");
        let act = o.onClick;
        if (act === "AUTO") act = link ? "NAVIGATE" : this.hasKids(n) ? "TOGGLE" : "EVENT";
        if (act === "NAVIGATE" && link) this._navigate(String(link), n, ev);
        else if (act === "SET_ITEM" && o.clickItem) {
            if (window.apex && apex.item) apex.item(o.clickItem).setValue(n.id);
        } else if (act === "TOGGLE") this.toggle(n.id);
    }

    _navigate(url, n, ev) {
        const el = n.el;
        // APEX 24.2+ prepares a modal page link as "#action$a-dialog-open?..."; only APEX can run it
        if (/^#action\$/.test(url) && window.apex && apex.navigation) {
            apex.navigation.redirect(url);
            return;
        }
        if (/^javascript:/i.test(url)) {
            // e.g. apex_page.get_url for a modal page: apex.navigation.dialog(...,this)
            let code = url.replace(/^javascript:/i, "");
            try { code = decodeURIComponent(code); } catch (e) { /* not encoded */ }
            try {
                // eslint-disable-next-line no-new-func
                new Function(code).call(el);
            } catch (e) {
                if (window.console) console.error("Hierarchy Pro: link failed", e);
            }
            return;
        }
        // Link Attributes target="..." picks the window; Ctrl / Cmd + click always opens a new tab
        const target = this.linkAttrs.target || ((ev && (ev.ctrlKey || ev.metaKey)) ? "_blank" : null);
        if (target && target !== "_self") {
            window.open(url, target, "noopener");
        } else if (window.apex && apex.navigation) {
            apex.navigation.redirect(url);
        } else location.href = url;
    }

    select(id) {
        const n = this._get(id);
        const old = this.sel;
        this.sel = n && !n.more ? n : null;
        if (old && old.el) this._syncNode(old);
        if (this.sel && this.sel.el) this._syncNode(this.sel);
        if (old !== this.sel) this._fire("selection_change", this.sel ? this._eventData(this.sel) : { id: null });
    }

    getSelection() {
        return this.sel ? this.getNode(this.sel.id) : null;
    }

    _eventData(n) {
        return Object.assign({ id: n.id }, this.getNode(n.id) || {}, { element: n.el });
    }

    getNode(id) {
        const n = this.nodes.get(String(id));
        if (!n) return null;
        const data = {};
        if (n.r) this.cols.forEach((c, i) => (data[c] = n.r[i]));
        return {
            id: n.id,
            parentId: n.parent ? n.parent.id : null,
            title: this._plain(n, "title") || n.vt || "",
            subtitle: this._plain(n, "subtitle"),
            level: (n.depth || 0) + 1,
            childCount: this.kidCount(n),
            descendantCount: n.desc || 0,
            expanded: !!n.exp,
            data
        };
    }

    getData() {
        return { columns: this.cols.slice(), rows: Array.from(this.nodes.values()).filter(n => n.r).map(n => n.r) };
    }

    /* ---------------- highlight ---------------- */

    setPath(id) {
        const n = this._get(id);
        if (!n || n.more) return this.clearPath();
        this.path = n;
        const set = new Set();
        for (let c = n; c; c = c.parent) set.add(c.id);
        if (this.o.pathSubtree) {
            const st = [n];
            while (st.length) {
                const c = st.pop();
                set.add(c.id);
                c.kids.forEach(k => st.push(k));
            }
        }
        this.pathSet = set;
        this._applyMarks();
    }

    clearPath() {
        if (!this.path && !this.pathSet) return;
        this.path = null;
        this.pathSet = null;
        this._applyMarks();
    }

    // highlights several nodes (opening the path to each); fit = zoom to show them all
    highlight(ids, fit) {
        ids = this._ids(ids);
        this.hl = new Set(ids);
        return Promise.all(ids.map(i => this.expandTo(i))).then(() => {
            this.update({ animate: true });
            this._applyMarks();
            if (fit) this.fitTo(ids);
        });
    }

    // zooms so the given nodes are all in view
    fitTo(ids) {
        const list = this._ids(ids).map(i => this._get(i)).filter(n => n && n.box && this.V.includes(n));
        if (!list.length) return;
        if (list.length === 1) return this.centerOn(list[0], Math.max(this.t.k, 0.9));
        this._measureVp();
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const n of list) {
            x0 = Math.min(x0, n.box.x); y0 = Math.min(y0, n.box.y);
            x1 = Math.max(x1, n.box.x + n.w); y1 = Math.max(y1, n.box.y + n.h);
        }
        const pad = 60;
        let k = Math.min((this.vw - pad * 2) / (x1 - x0), (this.vh - pad * 2) / (y1 - y0), 1);
        k = Math.max(this.o.minZoom, k);
        this._setTransform(zoomIdentity.translate(this.vw / 2 - (x0 + x1) / 2 * k, this.vh / 2 - (y0 + y1) / 2 * k).scale(k));
    }

    clearHighlight() {
        this.hl = new Set();
        this._applyMarks();
    }

    focusNode(id, opts) {
        return this.expandTo(id).then(n => {
            if (!n) return null;
            if (opts && opts.select) this.select(n.id, true);
            this.update({ animate: true });
            this.hl = new Set([n.id]);
            this._applyMarks();
            this.centerOn(n, Math.max(this.t.k, 0.9));
            this._pulse(n);
            return n;
        });
    }

    _pulse(n) {
        if (!n.el) return;
        n.el.classList.remove("hcp-pulse");
        void n.el.offsetWidth;
        n.el.classList.add("hcp-pulse");
    }

    // apply highlight / match / path / legend classes to visible nodes and links
    _applyMarks() {
        const ps = this.pathSet;
        const lg = this.lgFilter;
        const sf = this.onlyHl ? null : this.stFilter;
        const li = this.ci.legend;
        const dim = !!ps || !!lg || !!sf;
        this.el.classList.toggle("hcp-dim", dim);
        const ms = new Set(this.matches.map(n => n.id));
        const cur = this.matches[this.mi];
        for (const n of this.V) {
            const el = n.el;
            if (!el) continue;
            const f = sf && !ps && !lg ? this._flag(n) : null;
            const onP = ps ? ps.has(n.id) : lg ? li >= 0 && this._v(n, "legend") === lg : sf ? !!f && f.label === sf : false;
            el.classList.toggle("hcp-on", onP);
            el.classList.toggle("hcp-hl", this.hl.has(n.id));
            el.classList.toggle("hcp-match", ms.has(n.id));
            el.classList.toggle("hcp-cur", cur === n);
            const l = this.linkEls.get(n.id);
            if (l) {
                const on = ps ? ps.has(n.id) && n.vp && ps.has(n.vp.id) : false;
                l.classList.toggle("hcp-lk--on", on);
            }
        }
    }

    /* ---------------- search ---------------- */

    _text(n) {
        if (n.txt) return n.txt;
        const f = this._flag(n);
        const parts = [this._plain(n, "title"), this._plain(n, "subtitle"), this._plain(n, "badge"), f && f.label];
        if (n.r) for (const f of this.fields) parts.push(stripTags(n.r[f.i]));
        return (n.txt = norm(parts.join(" \u0001 ")));
    }

    search(term, keepPos) {
        const raw = String(term || "").trim();
        term = norm(raw);
        this.term = term;
        if (!term) {
            this.matches = [];
            this.mi = -1;
            this._searchUi();
            this._applyMarks();
            return Promise.resolve([]);
        }
        const done = list => {
            if (this.term !== term) return list;
            this.matches = list;
            this.mi = list.length ? (keepPos ? Math.min(Math.max(this.mi, 0), list.length - 1) : 0) : -1;
            this._searchUi();
            this._fire("search", { term, count: list.length });
            if (list.length) this._goMatch(keepPos);
            else this._applyMarks();
            return list;
        };
        if (this.lazy) {
            return this._request({ x01: "SEARCH", x02: raw }).then(res => {
                if (res && res.error) throw new Error(res.error);
                this._ingest(res, "merge");
                this._derive();
                const ids = (res.ids || []).map(String);
                return done(ids.map(i => this.nodes.get(i)).filter(Boolean));
            });
        }
        const words = term.split(/\s+/);
        const list = this.order.filter(n => {
            const t = this._text(n);
            return words.every(w => t.includes(w));
        });
        return Promise.resolve(done(list));
    }

    _searchUi() {
        if (!this.qEl) return;
        const box = this.qEl.parentNode;
        const cnt = box.querySelector(".hcp-count");
        const prev = box.querySelector('[data-act="prev"]');
        const next = box.querySelector('[data-act="next"]');
        const has = this.matches.length > 0;
        cnt.textContent = this.term ? (has ? fmt(this.msg.MATCHES, this.mi + 1, this.matches.length) : this.msg.NO_MATCH) : "";
        box.classList.toggle("hcp-search--none", !!this.term && !has);
        prev.hidden = next.hidden = this.matches.length < 2;
    }

    _step(d) {
        if (!this.matches.length) return;
        this.mi = (this.mi + d + this.matches.length) % this.matches.length;
        this._searchUi();
        this._goMatch();
    }

    _goMatch(quiet) {
        const n = this.matches[this.mi];
        if (!n) return;
        this.expandTo(n.id).then(() => {
            this.update({ animate: true });
            this._applyMarks();
            if (!quiet) {
                this.centerOn(n, Math.max(this.t.k, 0.8));
                this._pulse(n);
            }
        });
    }

    /* ---------------- drill (show one branch) ---------------- */

    drillTo(id) {
        const n = id === null || id === undefined ? null : this.nodes.get(String(id));
        this.viewRoot = n;
        if (n) n.exp = true;
        this._save();
        this.update({ animate: true });
        this.fit();
    }

    _crumbs() {
        const c = this.crumbs;
        if (!this.viewRoot) {
            c.hidden = true;
            c.textContent = "";
            return;
        }
        const chain = [];
        for (let x = this.viewRoot; x; x = x.parent) chain.unshift(x);
        let h = `<button type="button" class="hcp-crumb" data-act="crumb" data-id="">${icon("home")}<span>${esc(this.msg.ALL)}</span></button>`;
        chain.forEach((x, i) => {
            const last = i === chain.length - 1;
            h += `<span class="hcp-sep">${icon("chevron")}</span><button type="button" class="hcp-crumb" data-act="crumb" data-id="${esc(x.id)}"${last ? ' aria-current="true"' : ""}>${esc(this._plain(x, "title") || x.vt)}</button>`;
        });
        c.innerHTML = h;
        c.setAttribute("aria-label", this.msg.SHOW_BRANCH);
        c.hidden = false;
    }

    /* ---------------- style / orientation ---------------- */

    setOrientation(o) {
        o = String(o || "").toUpperCase();
        if (!ORIENTS.includes(o) || o === this.orient) return;
        this.orient = o;
        this._classes();
        this._save();
        this.update({ animate: true });
        this.fit();
    }

    setStyle(s) {
        s = String(s || "").toUpperCase();
        if (!this.views.includes(s)) return;
        this._finishAnim();
        this.style = s;
        this._classes();
        // rebuild node elements, keep positions so the change animates
        for (const n of this.V) {
            if (n.el) {
                const keep = n.cur;
                n.el.remove();
                n.el = null;
                n.keep = keep;
            }
        }
        this.update({ animate: true });
        for (const n of this.V) n.keep = null;
        this._save();
        this.fit();
    }

    setOption(name, value) {
        this.o[name] = value;
        if (name === "linkAttributes") {
            this.linkAttrs = parseLinkAttrs(value);
            return this.setStyle(this.style);
        }
        if (name === "accent" || name === "highlightColor") {
            this._classes();
            return this._drawMini();
        }
        if (name === "compact" || name === "shadow" || name === "rounded") {
            this._classes();
            return this.setStyle(this.style === "CUSTOM" ? "CUSTOM" : this.style, true);
        }
        if (["connector", "leafLayout", "siblingGap", "levelGap", "levelBands", "pathSubtree"].includes(name)) {
            if (this.V.length) this._bounds(this.V);
            return this.update({ animate: true });
        }
        if (["nodeWidth", "photos", "hiddenFields"].includes(name) || CONTENT[name]) return this.setStyle(this.style);
        if (name === "miniMap") return this._drawMini();
        if (name === "legend") return this._legend();
    }

    /* ---------------- user customization ---------------- */

    // applies one look setting; with User Customization on it is also saved for this user
    _pref(k, v) {
        if (k === "style") this.setStyle(v);
        else if (k === "orientation") this.setOrientation(v);
        else this.setOption(k, v);
        if (!this.custom) return;
        const same = Array.isArray(v) ? JSON.stringify(v) === JSON.stringify(this.base[k] || []) : v === this.base[k];
        if (same || (v === null && isBlank(this.base[k]))) delete this.prefs[k];
        else this.prefs[k] = v;
        this._savePrefs();
        this._cfgSync();
    }

    _savePrefs() {
        clearTimeout(this.prefsT);
        this.prefsT = setTimeout(() => {
            const p = Object.keys(this.prefs).length ? this.prefs : null;
            const done = () => this._cfgSaved();
            if (this.custom === "BROWSER") {
                localStore(this.prefsKey, p);
                done();
            } else {
                this._request({ x01: "PREFS", x02: p ? JSON.stringify(p) : "" })
                    .then(res => { if (res && res.error) throw new Error(res.error); done(); })
                    .catch(err => { if (window.console) console.error("Hierarchy Pro: customization not saved", err); });
            }
            this._fire("customize", { prefs: Object.assign({}, this.prefs) });
        }, 400);
    }

    resetCustomization() {
        const keep = this.prefs;
        this.prefs = {};
        Object.keys(keep).forEach(k => {
            const v = this.base[k];
            if (k === "style") this.setStyle(v || "AVATAR");
            else if (k === "orientation") this.setOrientation(v || "TB");
            else this.setOption(k, v);
        });
        if (this.custom) this._savePrefs();
        this._cfgSync();
    }

    getCustomization() {
        return Object.assign({}, this.prefs);
    }

    _cfgToggle() {
        if (this.cfgEl) return this._cfgClose();
        const m = this.msg;
        const seg = (k, list, label, ic) => `<div class="hcp-seg" role="radiogroup" aria-label="${esc(label)}" data-k="${k}">` +
            list.map(v => `<button type="button" role="radio" data-v="${v}" title="${esc(ic ? ic(v).t : "")}" aria-label="${esc(ic ? ic(v).t : v)}">${ic ? ic(v).h : ""}</button>`).join("") + "</div>";
        const sw = (k, label) => `<div class="hcp-sws" role="radiogroup" aria-label="${esc(label)}" data-k="${k}">` +
            [null].concat(ACCENTS).map(c => `<button type="button" role="radio" data-v="${c || ""}" class="${c ? "" : "hcp-sw--theme"}" style="${c ? "--c:" + c : ""}" title="${esc(c || m.C_THEME)}" aria-label="${esc(c || m.C_THEME)}"></button>`).join("") + "</div>";
        const tog = (k, label) => `<label class="hcp-tog"><input type="checkbox" data-k="${k}"><span class="hcp-tog-s" aria-hidden="true"></span><span>${esc(label)}</span></label>`;
        const rng = (k, label, min, max, step) => `<label class="hcp-rng"><span>${esc(label)}</span><output data-o="${k}"></output>` +
            `<input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" aria-label="${esc(label)}"></label>`;
        const fields = (this.fields || []).map(f => `<label class="hcp-tog hcp-fld"><input type="checkbox" data-f="${esc(f.c)}"><span class="hcp-tog-s" aria-hidden="true"></span><span>${esc(f.l)}</span></label>`).join("");
        const h =
            `<div class="hcp-cfg-hd"><b>${esc(m.CUSTOMIZE)}</b><button type="button" class="hcp-btn" data-c="close" title="${esc(m.CLOSE)}" aria-label="${esc(m.CLOSE)}">${icon("close")}</button></div>` +
            `<div class="hcp-cfg-bd">` +
            `<h4>${esc(m.C_STYLE)}</h4><div class="hcp-stys" role="radiogroup" aria-label="${esc(m.C_STYLE)}" data-k="style">` +
            this.views.map(s => `<button type="button" role="radio" data-v="${s}"><svg viewBox="0 0 40 28" aria-hidden="true" focusable="false">${STYLE_PREVIEW[s]}</svg><span>${esc(m["S_" + s])}</span></button>`).join("") + "</div>" +
            `<h4>${esc(m.C_CONTENT)}</h4><div class="hcp-togs">` + tog("showSubtitle", m.C_SUBTITLE) + tog("showBadge", m.C_BADGE) + tog("showStatus", m.C_STATUS) +
            (this.ci && this.ci.footer >= 0 ? tog("showFooter", m.C_FOOTER) : "") +
            tog("showTotals", m.C_TOTALS) + (fields ? tog("showBody", m.C_BODY) : "") + "</div>" +
            (fields ? `<div class="hcp-flds"><div class="hcp-togs">${fields}</div></div>` : "") +
            `<h4>${esc(m.C_LAYOUT)}</h4>` + seg("orientation", ORIENTS, m.C_LAYOUT, v => ({ t: m[v], h: icon("o_" + v.toLowerCase()) })) +
            `<h4>${esc(m.C_LOOK)}</h4><div class="hcp-togs">` + tog("compact", m.C_COMPACT) + tog("photos", m.C_PHOTOS) + "</div>" +
            // the everyday choices are above; the rest waits behind "More settings"
            `<details class="hcp-more"${this.cfgMore ? " open" : ""}><summary>${esc(m.C_MORE)}</summary>` +
            `<h4>${esc(m.C_CONNECTOR)}</h4>` + seg("connector", CONNECTORS, m.C_CONNECTOR, v => ({ t: m["CN_" + v], h: icon("c_" + v.toLowerCase()) })) +
            `<h4>${esc(m.C_LEAF)}</h4>` + seg("leafLayout", LEAFS, m.C_LEAF, v => ({ t: m["LF_" + v], h: `<span>${esc(m["LF_" + v])}</span>` })) +
            `<h4>${esc(m.C_SIZE)}</h4>` + rng("nodeWidth", m.C_WIDTH, 120, 360, 10) + rng("siblingGap", m.C_HGAP, 4, 80, 2) + rng("levelGap", m.C_VGAP, 20, 140, 4) +
            `<h4>${esc(m.C_ACCENT)}</h4>` + sw("accent", m.C_ACCENT) +
            `<h4>${esc(m.C_HLCOLOR)}</h4>` + sw("highlightColor", m.C_HLCOLOR) +
            `<h4>${esc(m.C_SHOW)}</h4><div class="hcp-togs">` + tog("rounded", m.C_ROUNDED) + tog("shadow", m.C_SHADOW) +
            tog("legend", m.C_LEGEND) + tog("miniMap", m.C_MINIMAP) + tog("levelBands", m.C_BANDS) + "</div>" +
            "</details></div>" +
            `<div class="hcp-cfg-ft"><span class="hcp-cfg-ok" aria-live="polite"></span><button type="button" class="hcp-cfg-reset" data-c="reset">${icon("reset")}<span>${esc(m.C_RESET)}</span></button></div>`;
        const p = document.createElement("div");
        p.className = "hcp-cfg";
        p.setAttribute("role", "dialog");
        p.setAttribute("aria-label", m.CUSTOMIZE);
        p.innerHTML = h;
        this.vp.appendChild(p);
        this.cfgEl = p;
        p.querySelector(".hcp-more").addEventListener("toggle", ev => (this.cfgMore = ev.target.open));
        p.addEventListener("click", ev => {
            const c = ev.target.closest("[data-c]");
            if (c) return c.getAttribute("data-c") === "close" ? this._cfgClose(true) : this.resetCustomization();
            const b = ev.target.closest("[data-v]");
            const g = b && b.closest("[data-k]");
            if (!g) return;
            const k = g.getAttribute("data-k");
            let v = b.getAttribute("data-v");
            if (k === "accent" || k === "highlightColor") v = v || null;
            this._pref(k, v);
        });
        p.addEventListener("change", ev => {
            const i = ev.target;
            if (i.type !== "checkbox") return;
            if (i.hasAttribute("data-f")) {
                // body fields: remember the ones switched off
                const off = Array.from(p.querySelectorAll("input[data-f]")).filter(x => !x.checked).map(x => x.getAttribute("data-f"));
                return this._pref("hiddenFields", off);
            }
            this._pref(i.getAttribute("data-k"), i.checked);
        });
        const slide = debounce((k, v) => this._pref(k, v), 160);
        p.addEventListener("input", ev => {
            const i = ev.target;
            if (i.type !== "range") return;
            const k = i.getAttribute("data-k");
            const out = p.querySelector(`[data-o="${k}"]`);
            if (out) out.textContent = i.value + "px";
            slide(k, +i.value);
        });
        // Esc closes the panel wherever the focus is (a disabled Reset button drops it to the body)
        this.cfgKey = ev => {
            if (ev.key === "Escape" && !document.querySelector(".hcp-menu")) this._cfgClose(p.contains(document.activeElement));
        };
        document.addEventListener("keydown", this.cfgKey);
        this._cfgSync();
        const b = this.el.querySelector('[data-act="customize"]');
        if (b) { b.setAttribute("aria-expanded", "true"); b.classList.add("is-on"); }
        const first = p.querySelector('[aria-checked="true"]') || p.querySelector("button");
        if (first) first.focus({ preventScroll: true });
    }

    _cfgClose(refocus) {
        if (!this.cfgEl) return;
        this.cfgEl.remove();
        this.cfgEl = null;
        document.removeEventListener("keydown", this.cfgKey);
        const b = this.el.querySelector('[data-act="customize"]');
        if (b) {
            b.setAttribute("aria-expanded", "false");
            b.classList.remove("is-on");
            if (refocus) b.focus({ preventScroll: true });
        }
    }

    // shows the current values in the open panel
    _cfgSync() {
        const p = this.cfgEl;
        if (!p) return;
        const o = this.o;
        const cur = { style: this.style, orientation: this.orient };
        // switches for content the current view has no place for are shown but disabled
        const avail = k => (CONTENT[k] && CONTENT[k] !== "totals" ? this._has(CONTENT[k]) : k === "photos" ? this._has("photo") : true);
        const dis = (el, off) => {
            el.disabled = off;
            const l = el.closest("label");
            if (l) { l.classList.toggle("is-off", off); l.title = off ? this.msg.C_NOT_IN_VIEW : ""; }
        };
        p.querySelectorAll("[data-k]").forEach(g => {
            const k = g.getAttribute("data-k");
            const v = k in cur ? cur[k] : o[k];
            if (g.tagName === "INPUT" && g.type === "checkbox") {
                g.checked = v !== false && !!v;
                dis(g, !avail(k));
            } else if (g.tagName === "INPUT" && g.type === "range") {
                const val = k === "nodeWidth" ? this.nodeW : +v || 0;
                g.value = val;
                const out = p.querySelector(`[data-o="${k}"]`);
                if (out) out.textContent = val + "px";
            } else {
                g.querySelectorAll("[data-v]").forEach(b => {
                    const bv = b.getAttribute("data-v");
                    const on = (k === "accent" || k === "highlightColor") ? bv === (safeColor(v) || "") : bv === v;
                    b.setAttribute("aria-checked", String(on));
                });
            }
        });
        // the field list only matters on views with a body
        const fl = p.querySelector(".hcp-flds");
        if (fl) fl.hidden = !this._has("body");
        const off = new Set(o.hiddenFields || []);
        p.querySelectorAll("input[data-f]").forEach(i => {
            i.checked = !off.has(i.getAttribute("data-f"));
            dis(i, !this._show("body"));
        });
        const has = Object.keys(this.prefs).length > 0;
        const r = p.querySelector('[data-c="reset"]');
        if (r) r.disabled = !has;
    }

    _cfgSaved() {
        const s = this.cfgEl && this.cfgEl.querySelector(".hcp-cfg-ok");
        if (!s) return;
        s.textContent = this.msg.C_SAVED;
        s.classList.add("is-on");
        clearTimeout(this.savedT);
        this.savedT = setTimeout(() => s.classList.remove("is-on"), 1600);
    }

    /* ---------------- keyboard ---------------- */

    _setFocus(n, move) {
        if (!n || !n.el) return;
        this.focusId = n.id;
        for (const x of this.V) if (x.el) x.el.tabIndex = x === n ? 0 : -1;
        if (move) {
            if (n.culled) { n.el.style.display = ""; n.culled = false; }
            n.el.focus({ preventScroll: true });
            this._ensureVisible(n);
        }
    }

    _key(ev) {
        const n = this._byEl(ev.target.closest(".hcp-node"));
        if (!n || ev.target !== n.el) return;
        const k = ev.key;
        const map = {
            TB: { ArrowDown: "child", ArrowUp: "parent", ArrowLeft: "prev", ArrowRight: "next" },
            RADIAL: { ArrowDown: "child", ArrowUp: "parent", ArrowLeft: "prev", ArrowRight: "next" },
            BT: { ArrowUp: "child", ArrowDown: "parent", ArrowLeft: "prev", ArrowRight: "next" },
            LR: { ArrowRight: "child", ArrowLeft: "parent", ArrowUp: "prev", ArrowDown: "next" },
            RL: { ArrowLeft: "child", ArrowRight: "parent", ArrowUp: "prev", ArrowDown: "next" }
        }[this.eo];
        let dir = map[k];
        if (this.rtl && (this.eo === "TB" || this.eo === "BT" || this.eo === "RADIAL") && (dir === "prev" || dir === "next")) {
            dir = dir === "prev" ? "next" : "prev";
        }
        let target = null;
        if (dir === "child") {
            if (this.hasKids(n) && !n.exp) { this.expand(n.id); ev.preventDefault(); return; }
            target = n.shown[0];
        } else if (dir === "parent") target = n.vp;
        else if (dir === "prev" || dir === "next") {
            const sib = n.vp ? n.vp.shown : this.V.filter(x => x.vd === 0);
            target = sib[sib.indexOf(n) + (dir === "prev" ? -1 : 1)];
        } else if (k === "Enter") {
            if (n.more) this._showMore(n.parent); else this._click(n, ev);
        } else if (k === " " || k === "Spacebar") {
            if (n.more) this._showMore(n.parent); else this.toggle(n.id);
        } else if (k === "Home") target = this.V[0];
        else if (k === "End") target = this.V[this.V.length - 1];
        else if (k === "ContextMenu" || (k === "F10" && ev.shiftKey)) {
            if (this.o.contextMenu && !n.more) {
                const r = n.el.getBoundingClientRect();
                this._nodeMenu(n, { x: r.left + r.width / 2, y: r.bottom });
            }
        } else if (k === "*") {
            this.expandBranch(n.id, true);
        } else return;
        ev.preventDefault();
        if (target) this._setFocus(target, true);
    }

    /* ---------------- menus ---------------- */

    _menu(anchor, items, point) {
        this._closeMenu();
        const m = document.createElement("div");
        m.className = "hcp-menu";
        m.setAttribute("role", "menu");
        m.innerHTML = items.map((it, i) =>
            `<button type="button" role="${it.checked !== undefined ? "menuitemradio" : "menuitem"}" data-i="${i}" tabindex="-1"` +
            (it.checked !== undefined ? ` aria-checked="${!!it.checked}"` : "") + ">" +
            `<span class="hcp-mk">${it.checked ? icon("check") : ""}</span><span>${esc(it.label)}</span></button>`).join("");
        (this.isFs ? this.el : document.body).appendChild(m);
        if (this.rtl) m.dir = "rtl";
        const r = point ? { left: point.x, right: point.x, bottom: point.y, top: point.y } : anchor.getBoundingClientRect();
        const mw = m.offsetWidth, mh = m.offsetHeight;
        let x = this.rtl ? r.right - mw : r.left;
        let y = r.bottom + 4;
        x = Math.max(8, Math.min(x, window.innerWidth - mw - 8));
        if (y + mh > window.innerHeight - 8) y = Math.max(8, r.top - mh - 4);
        m.style.left = x + "px";
        m.style.top = y + "px";
        const btns = Array.from(m.querySelectorAll("button"));
        const close = (refocus) => {
            this._closeMenu();
            if (refocus && anchor && anchor.focus) anchor.focus({ preventScroll: true });
        };
        m.addEventListener("click", ev => {
            const b = ev.target.closest("button");
            if (!b) return;
            close(true);
            items[+b.getAttribute("data-i")].run();
        });
        m.addEventListener("keydown", ev => {
            const i = btns.indexOf(document.activeElement);
            if (ev.key === "ArrowDown") btns[(i + 1) % btns.length].focus();
            else if (ev.key === "ArrowUp") btns[(i - 1 + btns.length) % btns.length].focus();
            else if (ev.key === "Escape" || ev.key === "Tab") close(true);
            else return;
            ev.preventDefault();
        });
        const out = ev => { if (!m.contains(ev.target)) close(false); };
        setTimeout(() => document.addEventListener("pointerdown", out, true), 0);
        this.menuEl = m;
        this.menuOut = out;
        const ck = btns.find(b => b.getAttribute("aria-checked") === "true") || btns[0];
        if (ck) ck.focus();
    }

    _closeMenu() {
        if (this.menuEl) {
            this.menuEl.remove();
            document.removeEventListener("pointerdown", this.menuOut, true);
            this.menuEl = null;
        }
    }

    _nodeMenu(n, pt) {
        const m = this.msg;
        const items = [];
        if (this._v(n, "link")) items.push({ label: m.OPEN, run: () => this._navigate(String(this._v(n, "link")), n) });
        items.push({ label: m.FOCUS, run: () => this.focusNode(n.id) });
        if (this.hasKids(n)) {
            items.push({ label: m.EXPAND_BRANCH, run: () => this.expandBranch(n.id, true) });
            items.push({ label: m.COLLAPSE_BRANCH, run: () => this.expandBranch(n.id, false) });
        }
        items.push({ label: m.HIGHLIGHT_PATH, run: () => this.setPath(n.id) });
        if (this.hasKids(n)) items.push({ label: m.SHOW_BRANCH, run: () => this.drillTo(n.id) });
        this._menu(n.el, items, pt);
    }

    /* ---------------- full screen ---------------- */

    toggleFullscreen() {
        const el = this.el;
        if (this.isFs) {
            if (document.fullscreenElement === el) document.exitFullscreen();
            else this._fsChanged(false);
        } else if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => this._fsChanged(true));
        } else this._fsChanged(true);
    }

    _fsChanged(on) {
        this.isFs = on;
        this.el.classList.toggle("hcp--fs", on);
        const b = this.el.querySelector('[data-act="fullscreen"]');
        if (b) {
            b.innerHTML = icon(on ? "exitFs" : "fullscreen");
            b.title = on ? this.msg.EXIT_FULLSCREEN : this.msg.FULLSCREEN;
            b.setAttribute("aria-label", b.title);
        }
        this._sizeViewport();
        setTimeout(() => { this._measureVp(); this.fit(); }, 60);
    }

    /* ---------------- export ---------------- */

    async _svgString() {
        this._finishAnim();
        for (const n of this.V) if (n.culled) n.el.style.display = "";
        const b = this.bounds;
        const pad = 24;
        const W = Math.ceil(b.x1 - b.x0 + pad * 2), H = Math.ceil(b.y1 - b.y0 + pad * 2);
        const vcss = getComputedStyle(this.vp);
        const bg = vcss.backgroundColor && vcss.backgroundColor !== "rgba(0, 0, 0, 0)" ? vcss.backgroundColor : "#ffffff";
        const font = getComputedStyle(this.el).fontFamily;
        const out = [];
        out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${r1(b.x0 - pad)} ${r1(b.y0 - pad)} ${W} ${H}" direction="${this.rtl ? "rtl" : "ltr"}">`);
        const fontCss = await this._fontFaces(font);
        if (fontCss) out.push(`<defs><style>${fontCss}</style></defs>`);
        out.push(`<rect x="${r1(b.x0 - pad)}" y="${r1(b.y0 - pad)}" width="${W}" height="${H}" fill="${bg}"/>`);
        // svg layer with computed paint inlined
        const svgParts = [this.gBands, this.gPanels, this.gLinks];
        for (const g of svgParts) {
            for (const e of Array.from(g.children)) {
                const cs = getComputedStyle(e);
                const c = e.cloneNode(true);
                ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "font-size", "font-weight", "font-family"].forEach(p => {
                    const v = cs.getPropertyValue(p);
                    if (v) c.setAttribute(p, v);
                });
                c.removeAttribute("class");
                out.push(new XMLSerializer().serializeToString(c));
            }
        }
        if (this.bandList) {
            const lc = getComputedStyle(this.el).getPropertyValue("--hcp-text") ? getComputedStyle(this.layer).color : "#555";
            for (const x of this.bandList) {
                const tx = this.L.horiz
                    ? `x="${r1(x.at + x.size / 2)}" y="${r1(b.y0 + 18)}" text-anchor="middle"`
                    : `x="${r1(this.rtl ? b.x1 - 10 : b.x0 + 10)}" y="${r1(x.at + 20)}" text-anchor="${this.rtl ? "end" : "start"}"`;
                out.push(`<text ${tx} fill="${lc}" opacity="0.7" font-size="11" font-weight="600" font-family="${esc(font)}">${esc(x.label)}</text>`);
            }
        }
        // nodes as foreignObject with inlined styles
        const ser = new XMLSerializer();
        const m = 18;
        for (const n of this.V) {
            if (!n.el) continue;
            const clone = await this._inlineClone(n.el);
            clone.style.transform = "none";
            clone.style.position = "absolute";
            clone.style.left = m + "px";
            clone.style.top = m + "px";
            const wrap = `<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${n.w + 2 * m}px;height:${n.h + 2 * m}px;font-family:${esc(font)};direction:${this.rtl ? "rtl" : "ltr"}">`;
            out.push(`<foreignObject x="${r1(n.box.x - m)}" y="${r1(n.box.y - m)}" width="${n.w + 2 * m}" height="${n.h + 2 * m}">${wrap}${ser.serializeToString(clone)}</div></foreignObject>`);
        }
        out.push("</svg>");
        this._cull();
        return { svg: out.join(""), W, H };
    }

    async _fontFaces(family) {
        const first = String(family || "").split(",")[0].replace(/["']/g, "").trim().toLowerCase();
        if (!first) return "";
        let css = "";
        let total = 0;
        for (const sh of Array.from(document.styleSheets)) {
            let rules;
            try { rules = sh.cssRules; } catch (e) { continue; }
            for (const r of Array.from(rules || [])) {
                if (!(r instanceof CSSFontFaceRule)) continue;
                const fam = (r.style.getPropertyValue("font-family") || "").replace(/["']/g, "").trim().toLowerCase();
                if (fam !== first) continue;
                const src = r.style.getPropertyValue("src");
                const mm = /url\((["']?)([^"')]+)\1\)/.exec(src || "");
                if (!mm) continue;
                try {
                    const url = new URL(mm[2], sh.href || location.href).href;
                    const blob = await (await fetch(url)).blob();
                    total += blob.size;
                    if (total > 3e6) break;
                    const data = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
                    css += `@font-face{font-family:"${r.style.getPropertyValue("font-family").replace(/["']/g, "")}";src:url(${data});font-weight:${r.style.getPropertyValue("font-weight") || "normal"};font-style:${r.style.getPropertyValue("font-style") || "normal"};}`;
                } catch (e) { /* font not fetchable - system fallback is used */ }
            }
        }
        return css;
    }

    async _inlineClone(el) {
        const PROPS = ["display", "position", "top", "left", "right", "bottom", "width", "height", "min-width", "max-width", "min-height", "box-sizing",
            "margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left",
            "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
            "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
            "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
            "background-color", "background-image", "color", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
            "text-align", "text-transform", "white-space", "overflow", "text-overflow", "opacity", "box-shadow", "flex", "flex-direction", "flex-wrap",
            "flex-shrink", "flex-grow", "align-items", "justify-content", "align-self", "gap", "row-gap", "column-gap", "grid-template-columns", "object-fit",
            "vertical-align", "direction", "z-index", "visibility", "transform", "-webkit-line-clamp", "-webkit-box-orient", "word-break", "overflow-wrap"];
        const clone = el.cloneNode(true);
        const src = [el, ...el.querySelectorAll("*")];
        const dst = [clone, ...clone.querySelectorAll("*")];
        for (let i = 0; i < src.length; i++) {
            const cs = getComputedStyle(src[i]);
            let s = "";
            for (const p of PROPS) {
                const v = cs.getPropertyValue(p);
                if (v !== "") s += p + ":" + v + ";";
            }
            // export the settled state, not a frame of an enter / pulse transition
            if (i === 0) s += "opacity:" + (this.el.classList.contains("hcp-dim") && !el.classList.contains("hcp-on") ? 0.28 : 1) + ";";
            if (src[i].classList.contains("hcp-card")) s += "transform:none;";
            dst[i].setAttribute("style", s);
            dst[i].removeAttribute("class");
            if (dst[i].tagName === "IMG") {
                const img = src[i];
                try {
                    const c = document.createElement("canvas");
                    c.width = img.naturalWidth || 64;
                    c.height = img.naturalHeight || 64;
                    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                    dst[i].setAttribute("src", c.toDataURL("image/png"));
                    dst[i].removeAttribute("loading");
                } catch (e) {
                    dst[i].remove(); // cross-origin photo: keep the initials underneath
                }
            }
        }
        return clone;
    }

    async exportImage(format, fileName) {
        format = String(format || "png").toLowerCase();
        const name = (fileName || this.o.fileName || "hierarchy") + "." + format;
        this._busy(true);
        try {
            const { svg, W, H } = await this._svgString();
            if (format === "svg") {
                this._download(new Blob([svg], { type: "image/svg+xml" }), name);
                return;
            }
            const img = new Image();
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
            await img.decode();
            let scale = Math.min(2, 16000 / W, 16000 / H, Math.sqrt(1.2e8 / (W * H)));
            scale = Math.max(scale, 0.1);
            const c = document.createElement("canvas");
            c.width = Math.round(W * scale);
            c.height = Math.round(H * scale);
            const ctx = c.getContext("2d");
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, W, H);
            await new Promise(res => c.toBlob(b => { this._download(b, name); res(); }, "image/png"));
        } catch (e) {
            if (window.console) console.error("Hierarchy Pro: export failed", e);
            this._showToast(this.msg.ERROR);
        } finally {
            this._busy(false);
        }
    }

    async print() {
        const { svg } = await this._svgString();
        const f = document.createElement("iframe");
        f.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
        document.body.appendChild(f);
        const d = f.contentDocument;
        d.open();
        d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(this.o.fileName) +
            '</title><style>@page{size:auto;margin:10mm}html,body{margin:0}img{max-width:100%;max-height:100vh;display:block;margin:auto}</style></head><body><img alt=""></body></html>');
        d.close();
        const img = d.querySelector("img");
        img.onload = () => {
            f.contentWindow.focus();
            f.contentWindow.print();
            setTimeout(() => f.remove(), 1000);
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }

    _download(blob, name) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }

    /* ---------------- events out ---------------- */

    _fire(name, data, nativeName) {
        const ev = nativeName || EV + name;
        const a = window.apex;
        if (a && a.event && a.event.trigger) a.event.trigger(this.regionEl, ev, data);
        else this.regionEl.dispatchEvent(new CustomEvent(ev, { detail: data, bubbles: true }));
    }

    destroy() {
        this._closeMenu();
        this._cfgClose();
        if (this.ro) this.ro.disconnect();
        this.el.innerHTML = "";
        instances.delete(this.regionId);
    }
}

/* ------------------------------------------------------------------ */
/* contour packing + connector helpers                                 */
/* ------------------------------------------------------------------ */

// Places subtrees side by side as close as their contours allow.
function pack(conts, gap) {
    const acc = conts[0].map(s => s.slice());
    const offs = [0];
    for (let j = 1; j < conts.length; j++) {
        const c = conts[j];
        let off = -Infinity;
        const m = Math.min(acc.length, c.length);
        for (let k = 0; k < m; k++) {
            if (!acc[k] || !c[k]) continue;
            const need = acc[k][1] - c[k][0] + (k === 0 ? gap : gap * 1.5);
            if (need > off) off = need;
        }
        if (off === -Infinity) off = acc[0][1] - c[0][0] + gap;
        offs.push(off);
        for (let k = 0; k < c.length; k++) {
            if (!c[k]) continue;
            const s0 = c[k][0] + off, s1 = c[k][1] + off;
            if (acc[k]) {
                if (s0 < acc[k][0]) acc[k][0] = s0;
                if (s1 > acc[k][1]) acc[k][1] = s1;
            } else acc[k] = [s0, s1];
        }
    }
    return { offs, acc };
}

// parent port -> along the depth axis to m -> across to the child -> into the child
function elbow3(pa, pb, m, ca, cb, rad, P) {
    if (Math.abs(cb - pb) < 0.5) return "M" + P(pa, pb) + "L" + P(ca, cb);
    const sa = ca >= pa ? 1 : -1;
    const sb = cb > pb ? 1 : -1;
    const r = Math.max(0, Math.min(rad, Math.abs(cb - pb) / 2, Math.abs(m - pa), Math.abs(ca - m)));
    if (!r) return "M" + P(pa, pb) + "L" + P(m, pb) + "L" + P(m, cb) + "L" + P(ca, cb);
    return "M" + P(pa, pb) + "L" + P(m - sa * r, pb) + "Q" + P(m, pb) + " " + P(m, pb + sb * r) +
        "L" + P(m, cb - sb * r) + "Q" + P(m, cb) + " " + P(m + sa * r, cb) + "L" + P(ca, cb);
}

// parent port -> along the spine to the item's row -> across into its side
function elbow2(pa, pb, ia, e, rad, P) {
    const sa = ia >= pa ? 1 : -1;
    const sb = e >= pb ? 1 : -1;
    const r = Math.max(0, Math.min(rad, Math.abs(ia - pa), Math.abs(e - pb)));
    if (!r) return "M" + P(pa, pb) + "L" + P(ia, pb) + "L" + P(ia, e);
    return "M" + P(pa, pb) + "L" + P(ia - sa * r, pb) + "Q" + P(ia, pb) + " " + P(ia, pb + sb * r) + "L" + P(ia, e);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Called by the plug-in's render procedure.
 * @param {string} regionId   region static id (DOM id of the region)
 * @param {object} options    options built from the plug-in attributes
 * @param {function} [initFn] "Initialization JavaScript Function": receives the
 *                            options and returns them (changed) - like native regions.
 */
export function init(regionId, options, initFn) {
    let o = Object.assign({}, options || {});
    if (typeof initFn === "function") o = initFn(o) || o;
    const el = document.getElementById(regionId + "_hcp");
    if (!el) throw new Error("Hierarchy Pro: container " + regionId + "_hcp not found");
    if (instances.has(regionId)) instances.get(regionId).destroy();
    const c = new Chart(regionId, el, o);
    instances.set(regionId, c);
    const a = window.apex;
    if (a && a.region && a.region.create && document.getElementById(regionId)) {
        a.region.create(regionId, {
            type: "HierarchyChartPro",
            widget: () => (a.jQuery ? a.jQuery(el) : el),
            refresh: () => c.refresh(),
            focus: () => { const f = c.layer.querySelector('.hcp-node[tabindex="0"]'); if (f) f.focus(); },
            expandAll: () => c.expandAll(),
            collapseAll: () => c.collapseAll(),
            expand: id => c.expand(id),
            collapse: id => c.collapse(id),
            toggle: id => c.toggle(id),
            expandTo: id => c.expandTo(id).then(n => { c.update({ animate: true }); return n ? c.getNode(n.id) : null; }),
            focusNode: id => c.focusNode(id),
            highlight: (ids, fit) => c.highlight(ids, fit),
            clearHighlight: () => { c.clearHighlight(); c.clearPath(); },
            fitTo: ids => c.fitTo(ids),
            showHighlightedOnly: on => c.showHighlightedOnly(on),
            statusFilter: v => c.statusFilter(v),
            getCustomization: () => c.getCustomization(),
            resetCustomization: () => c.resetCustomization(),
            customize: () => c._cfgToggle(),
            getViews: () => c.views.slice(),
            highlightPath: id => c.setPath(id),
            setOrientation: v => c.setOrientation(v),
            setStyle: v => c.setStyle(v),
            setOption: (k, v) => c.setOption(k, v),
            fit: () => c.fit(),
            zoomIn: () => c.zoomBy(1.3),
            zoomOut: () => c.zoomBy(1 / 1.3),
            search: t => c.search(t),
            drillTo: id => c.drillTo(id),
            exportImage: (f, n) => c.exportImage(f, n),
            print: () => c.print(),
            getNode: id => c.getNode(id),
            getSelection: () => c.getSelection(),
            select: id => c.select(id),
            getData: () => c.getData(),
            toggleFullscreen: () => c.toggleFullscreen()
        });
    }
    c.load(false);
    return c;
}

export function get(regionId) {
    return instances.get(regionId) || null;
}

export const messages = MSG;
export const styles = STYLES.slice();
export const orientations = ORIENTS.slice();
