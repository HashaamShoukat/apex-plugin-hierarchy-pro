// Writes tests/out/plsql-units.sql: compiles a throwaway copy of the package
// (HCP_TEST_PKG) that also exposes clean_prefs, runs assertions and drops the
// copy. The installed HIERARCHY_CHART_PLUGIN_PKG is not touched.
//   node tests/plsql-units.mjs  then, in SQLcl as the parsing schema:  @tests/out/plsql-units.sql
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const rd = f => readFileSync(new URL(f, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const rename = s => s.replace(/hierarchy_chart_plugin_pkg/gi, "hcp_test_pkg");
const spec = rename(rd("../db/hierarchy_chart_plugin_pkg.pks"))
    .replace(/end\s+hcp_test_pkg\s*;/i, "    function clean_prefs ( p_json in varchar2 ) return varchar2;\nend hcp_test_pkg;")
    .trimEnd().replace(/\/\s*$/, "");
const body = rename(rd("../db/hierarchy_chart_plugin_pkg.pkb")).trimEnd().replace(/\/\s*$/, "");

// saved customization: only known keys with valid values survive
const cases = [
    [`{"style":"BADGE","compact":true,"nodeWidth":240}`, `{"style":"BADGE","compact":true,"nodeWidth":240}`],
    [`{"style":"<script>","orientation":"LR"}`, `{"orientation":"LR"}`],
    [`{"accent":"#ff0000","highlightColor":"red;x:url(y)"}`, `{"accent":"#ff0000"}`],
    [`{"nodeWidth":9999,"siblingGap":12.6}`, `{"siblingGap":13}`],
    [`{"hiddenFields":["SALARY","bad name","PHONE"]}`, `{"hiddenFields":["SALARY","PHONE"]}`],
    [`{"onclick":"alert(1)"}`, null],
    [`not json`, null],
    [null, null]
];
const q = s => s === null ? "null" : "q'~" + s + "~'";
const asserts = cases.map(([i, w], n) => `    t(${n + 1}, hcp_test_pkg.clean_prefs(${q(i)}), ${q(w)});`).join("\n");

mkdirSync(new URL("out/", import.meta.url), { recursive: true });
writeFileSync(new URL("out/plsql-units.sql", import.meta.url), `set define off
set serveroutput on size unlimited
${spec}
/
${body}
/
show errors package body hcp_test_pkg
declare
    l_fail pls_integer := 0;
    procedure t ( p_no in pls_integer, p_got in varchar2, p_want in varchar2 ) is
    begin
        if (p_got is null and p_want is null) or p_got = p_want then
            dbms_output.put_line('ok   ' || p_no);
        else
            l_fail := l_fail + 1;
            dbms_output.put_line('FAIL ' || p_no || ': got [' || p_got || '] want [' || p_want || ']');
        end if;
    end t;
begin
${asserts}
    dbms_output.put_line(case when l_fail = 0 then 'all ${cases.length} passed' else l_fail || ' failed' end);
end;
/
drop package hcp_test_pkg;
`);
console.log(`tests/out/plsql-units.sql: ${cases.length} cases`);
