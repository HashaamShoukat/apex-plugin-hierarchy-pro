// Makes an APEX 26.1 plug-in export importable on older releases.
//   node tools/downlevel.mjs <export.sql> <signatures.txt> <out.sql> <yyyy.mm.dd> <release>
// signatures.txt: lines "CREATE_PLUGIN p_name" taken from ALL_ARGUMENTS of the
// target release's WWV_FLOW_IMP_SHARED. Every parameter of a create_* call that
// the target release does not know is removed (with its continuation lines), and
// the import_begin header is set to the target version.
import { readFileSync, writeFileSync } from "node:fs";

const [src, sigFile, out, ymd, release] = process.argv.slice(2);
const known = new Map();
for (const line of readFileSync(sigFile, "utf8").split(/\r?\n/)) {
    const [proc, arg] = line.trim().split(/\s+/);
    if (!proc || !arg) continue;
    if (!known.has(proc)) known.set(proc, new Set());
    known.get(proc).add(arg.toLowerCase());
}

const lines = readFileSync(src, "utf8").split(/\r?\n/);
const res = [];
const dropped = {};
let proc = null;
let skipping = false;
for (const line of lines) {
    const call = /^wwv_flow_imp_shared\.(create_\w+)\($/.exec(line);
    if (call) {
        proc = call[1].toUpperCase();
        skipping = false;
        res.push(line);
        continue;
    }
    if (proc) {
        if (/^\);/.test(line)) {
            proc = null;
            skipping = false;
            res.push(line);
            continue;
        }
        const param = /^[ ,](p_\w+)=>/.exec(line);
        if (param) {
            const ok = !known.has(proc) || known.get(proc).has(param[1]);
            skipping = !ok;
            if (!ok) {
                dropped[proc + "." + param[1]] = (dropped[proc + "." + param[1]] || 0) + 1;
                // the first parameter starts with a blank instead of a comma
                if (line.startsWith(" ")) throw new Error("cannot drop the first parameter " + param[1]);
                continue;
            }
        } else if (skipping) continue;
    }
    res.push(line);
}
let sql = res.join("\n")
    .replace(/p_version_yyyy_mm_dd=>'[\d.]+'/, `p_version_yyyy_mm_dd=>'${ymd}'`)
    .replace(/p_release=>'[\d.]+'/, `p_release=>'${release}'`);
writeFileSync(out, sql);
console.log("dropped:", JSON.stringify(dropped, null, 1));
