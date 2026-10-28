create or replace package body hierarchy_chart_plugin_pkg as

    ----------------------------------------------------------------------------
    -- Region attributes (Page Designer -> Attributes)
    -- Hierarchy                   Appearance                  Behavior
    --  1 Node ID Column *         19 Default View *           31 Initial Expand Levels
    --  2 Hierarchy Type           20 Views Users Can Pick     32 Max Children Shown
    --  3 Parent ID Column *       21 Custom Template          33 Orphan Nodes
    --  4 Level Column *           22 Card Content             34 On Node Click
    -- 49 Level Name Column        24 Options                  35 Link (Link Builder)
    -- Columns                    Layout                       36 Link Attributes
    --  5 Title Column *           25 Orientation              37 Click Page Item
    --  6 Subtitle Column          26 Connector Style         Highlighting
    --  9 Color Column             27 Leaf Layout              11 Highlight Column
    -- 10 Badge Column             28 Node Width               41 Highlight Color Column
    -- 12 Legend Column            29 Sibling Gap              38 Highlight Path
    -- 15-18 Body Column 1-4       30 Level Gap                40 Path Highlight Color
    -- 13 Footer Column           Images                      View
    -- 14 Roll-up Column            8 Icon Column              42 Toolbar
    -- 48 Roll-up Label            47 Image BLOB Query         43 User Customization
    --                                                         44 Height, 45 Fixed Height
    --                                                         46 Initial View
    -- (* required; Parent ID or Level depending on Hierarchy Type. 7, 23 and 39 are unused.)
    -- Hover text, child counts (also lazy), team sizes and sibling order are automatic.
    ----------------------------------------------------------------------------

    c_default_options constant varchar2(200) := 'shadow:rounded:photos:contextMenu:legend:ctrlWheel:animate';
    c_default_toolbar constant varchar2(200) := 'search:zoom:fit:expand:compact:photos:details:orientation:style:export:fullscreen';
    c_default_content constant varchar2(200) := 'subtitle:badge:status:body:footer:totals';
    c_all_views       constant varchar2(200) := 'AVATAR:CLASSIC:DETAILED:PILL:BUBBLE:HEADER:MINIMAL:BADGE:PHOTO:CUSTOM';
    c_max_rows        constant pls_integer   := 50000;
    c_in_chunk        constant pls_integer   := 500;
    -- computed column carrying the Link Builder URL of every node
    c_link_col        constant varchar2(30)  := 'HCP$LINK';

    type t_row  is table of varchar2(32767) index by pls_integer;
    type t_rows is table of t_row index by pls_integer;
    type t_num_map is table of pls_integer index by varchar2(4000);
    type t_str_map is table of varchar2(4000) index by varchar2(4000);

    -- column metadata of the region query (filled by the first fetch)
    g_names apex_t_varchar2;
    g_types apex_t_varchar2;
    g_masks apex_t_varchar2;
    -- role -> column name
    g_roles t_str_map;
    g_buf   varchar2(32767);
    -- Link Builder target (substitutions applied) and, when it has no #COLUMN# tokens, its final URL
    g_link     varchar2(32767);
    g_link_fix varchar2(32767);

    ----------------------------------------------------------------------------
    -- attribute access (APEX 24.1+ keeps every value in the .attributes collection)
    ----------------------------------------------------------------------------
    function ra ( p_region in apex_plugin.t_region, p_no in pls_integer ) return varchar2
    is
    begin
        return p_region.attributes.get_varchar2('attribute_' || to_char(p_no, 'FM00'));
    exception
        when others then
            return null;
    end ra;


    -- DOM id of the region element: 26.1 has a separate HTML DOM ID, older releases use the static id
    function region_dom_id ( p_region in apex_plugin.t_region ) return varchar2
    is
    begin
        $if $$hcp_dom_id $then
        return coalesce(p_region.dom_id, p_region.static_id, 'R' || p_region.id);
        $else
        return coalesce(p_region.static_id, 'R' || p_region.id);
        $end
    end region_dom_id;

    function num ( p_val in varchar2, p_default in number ) return number
    is
    begin
        return nvl(to_number(trim(p_val)), p_default);
    exception
        when value_error or invalid_number then return p_default;
    end num;

    function has ( p_list in varchar2, p_value in varchar2 ) return boolean
    is
    begin
        return instr(':' || p_list || ':', ':' || p_value || ':') > 0;
    end has;

    ----------------------------------------------------------------------------
    -- buffered output (one htp call per ~30 KB instead of one per value)
    ----------------------------------------------------------------------------
    procedure prn ( p_text in varchar2 )
    is
    begin
        if p_text is null then
            return;
        end if;
        if nvl(lengthb(g_buf), 0) + lengthb(p_text) > 30000 then
            if g_buf is not null then
                sys.htp.prn(g_buf);
            end if;
            g_buf := p_text;
        else
            g_buf := g_buf || p_text;
        end if;
    end prn;

    procedure flush
    is
    begin
        if g_buf is not null then
            sys.htp.prn(g_buf);
            g_buf := null;
        end if;
    end flush;

    function js ( p_val in varchar2 ) return varchar2
    is
    begin
        return case when p_val is null then 'null'
                    else '"' || apex_escape.json(substr(p_val, 1, 8000)) || '"' end;
    end js;

    ----------------------------------------------------------------------------
    -- Link attribute: a Link Builder target, prepared like a report column link.
    -- #COLUMN# tokens get the node's values (URL encoded), &ITEM. substitutions
    -- are applied, and apex_util.prepare_url adds the checksum - for a modal page
    -- it returns the apex.navigation.dialog(...) call, so it opens as a dialog.
    ----------------------------------------------------------------------------
    procedure init_link ( p_region in apex_plugin.t_region )
    is
    begin
        g_link     := ra(p_region, 35);
        g_link_fix := null;
        if g_link is not null then
            g_link := apex_plugin_util.replace_substitutions(p_value => g_link, p_escape => false);
            if not regexp_like(g_link, '#[A-Za-z0-9_$]+#') then
                g_link_fix := apex_util.prepare_url(p_url => g_link);
            end if;
        end if;
    end init_link;

    function row_link ( p_row in t_row ) return varchar2
    is
        l_url varchar2(32767) := g_link;
    begin
        if g_link_fix is not null then
            return g_link_fix;
        end if;
        for j in 1 .. g_names.count loop
            if instr(l_url, '#' || g_names(j) || '#') > 0 then
                l_url := replace(l_url, '#' || g_names(j) || '#', apex_util.url_encode(p_row(j)));
            end if;
        end loop;
        return apex_util.prepare_url(p_url => l_url);
    end row_link;

    ----------------------------------------------------------------------------
    -- User Customization saved per user (table hierarchy_chart_prefs, created by
    -- install.sql). Dynamic SQL, so the package compiles without the table.
    ----------------------------------------------------------------------------
    function prefs_key ( p_region in apex_plugin.t_region ) return varchar2
    is
    begin
        return substr(nvl(p_region.static_id, to_char(p_region.id)), 1, 255);
    end prefs_key;

    -- keeps only known keys with valid values, so stored text can never reach the page as code
    function clean_prefs ( p_json in varchar2 ) return varchar2
    is
        l_vals apex_json.t_values;
        l_out  varchar2(4000);
        l_s    varchar2(4000);
        l_n    number;
        l_b    boolean;
        procedure add ( p_key in varchar2, p_val in varchar2 ) is
        begin
            l_out := l_out || case when l_out is not null then ',' end || '"' || p_key || '":' || p_val;
        end add;
    begin
        if p_json is null then
            return null;
        end if;
        apex_json.parse(p_values => l_vals, p_source => p_json);
        for k in ( select column_value as nm
                     from table(apex_t_varchar2('style', 'orientation', 'connector', 'leafLayout')) ) loop
            l_s := apex_json.get_varchar2(p_path => k.nm, p_values => l_vals);
            if regexp_like(l_s, '^[A-Z]{2,10}$') then
                add(k.nm, '"' || l_s || '"');
            end if;
        end loop;
        for k in ( select column_value as nm
                     from table(apex_t_varchar2('compact', 'rounded', 'shadow', 'legend', 'miniMap', 'levelBands', 'photos',
                                                'showSubtitle', 'showBadge', 'showStatus', 'showTotals', 'showBody', 'showFooter')) ) loop
            begin
                l_b := apex_json.get_boolean(p_path => k.nm, p_values => l_vals);
                if l_b is not null then
                    add(k.nm, case when l_b then 'true' else 'false' end);
                end if;
            exception
                when others then null;
            end;
        end loop;
        for k in ( select column_value as nm
                     from table(apex_t_varchar2('nodeWidth', 'siblingGap', 'levelGap')) ) loop
            begin
                l_n := apex_json.get_number(p_path => k.nm, p_values => l_vals);
                if l_n between 0 and 420 then
                    add(k.nm, to_char(round(l_n), 'FM9990'));
                end if;
            exception
                when others then null;
            end;
        end loop;
        for k in ( select column_value as nm
                     from table(apex_t_varchar2('accent', 'highlightColor')) ) loop
            l_s := apex_json.get_varchar2(p_path => k.nm, p_values => l_vals);
            if regexp_like(l_s, '^#[0-9A-Fa-f]{3,8}$') then
                add(k.nm, '"' || l_s || '"');
            end if;
        end loop;
        -- body fields a user switched off: column names only
        if apex_json.does_exist(p_path => 'hiddenFields', p_values => l_vals) then
            l_s := null;
            for i in 1 .. least(nvl(apex_json.get_count(p_path => 'hiddenFields', p_values => l_vals), 0), 30) loop
                declare
                    l_c varchar2(4000) := apex_json.get_varchar2(p_path => 'hiddenFields[%d]', p0 => i, p_values => l_vals);
                begin
                    if regexp_like(l_c, '^[A-Z0-9_$#]{1,128}$') then
                        l_s := l_s || case when l_s is not null then ',' end || '"' || l_c || '"';
                    end if;
                end;
            end loop;
            add('hiddenFields', '[' || l_s || ']');
        end if;
        return case when l_out is not null then '{' || l_out || '}' end;
    exception
        when others then
            return null;
    end clean_prefs;

    function load_prefs ( p_region in apex_plugin.t_region ) return varchar2
    is
        l_json varchar2(4000);
    begin
        execute immediate
            'select prefs from hierarchy_chart_prefs
              where app_id = :1 and page_id = :2 and region_key = :3 and username = :4'
            into l_json
            using to_number(v('APP_ID')), to_number(v('APP_PAGE_ID')), prefs_key(p_region), upper(v('APP_USER'));
        return clean_prefs(l_json);
    exception
        when others then
            return null; -- nothing saved yet, or the table is not installed
    end load_prefs;

    procedure save_prefs ( p_region in apex_plugin.t_region, p_json in varchar2 )
    is
        l_json varchar2(4000) := clean_prefs(p_json);
    begin
        if l_json is null then
            execute immediate
                'delete from hierarchy_chart_prefs
                  where app_id = :1 and page_id = :2 and region_key = :3 and username = :4'
                using to_number(v('APP_ID')), to_number(v('APP_PAGE_ID')), prefs_key(p_region), upper(v('APP_USER'));
        else
            execute immediate
                'merge into hierarchy_chart_prefs t
                 using ( select :1 app_id, :2 page_id, :3 region_key, :4 username from dual ) s
                    on ( t.app_id = s.app_id and t.page_id = s.page_id
                         and t.region_key = s.region_key and t.username = s.username )
                  when matched then update set t.prefs = :5, t.updated_on = systimestamp
                  when not matched then insert ( app_id, page_id, region_key, username, prefs )
                                        values ( s.app_id, s.page_id, s.region_key, s.username, :6 )'
                using to_number(v('APP_ID')), to_number(v('APP_PAGE_ID')), prefs_key(p_region),
                      upper(v('APP_USER')), l_json, l_json;
        end if;
    end save_prefs;

    -- saving per user needs a signed-in user; public pages keep it in the browser
    function customize_mode ( p_region in apex_plugin.t_region ) return varchar2
    is
        l_mode varchar2(30) := nvl(ra(p_region, 43), 'NONE');
    begin
        if l_mode = 'DATABASE' and nvl(upper(v('APP_USER')), 'NOBODY') = 'NOBODY' then
            return 'BROWSER';
        end if;
        return l_mode;
    end customize_mode;

    ----------------------------------------------------------------------------
    -- column roles: chosen in the region's Columns settings (nothing is guessed)
    ----------------------------------------------------------------------------
    procedure resolve_roles ( p_region in apex_plugin.t_region )
    is
        procedure set_role ( p_role in varchar2, p_no in pls_integer ) is
            l_col varchar2(4000) := upper(trim(ra(p_region, p_no)));
        begin
            if l_col is not null then
                g_roles(p_role) := l_col;
            end if;
        end set_role;
    begin
        g_roles.delete;
        set_role('id', 1);
        if nvl(ra(p_region, 2), 'PARENT') = 'LEVEL' then
            set_role('level', 4);
        else
            set_role('parent', 3);
        end if;
        set_role('title', 5);
        set_role('subtitle', 6);
        set_role('icon', 8);
        set_role('color', 9);
        set_role('badge', 10);
        set_role('highlight', 11);
        set_role('legend', 12);
        set_role('footer', 13);
        set_role('rollup', 14);
        set_role('statusColor', 41);
        set_role('levelName', 49);
    end resolve_roles;

    -- the region column called p_name (for its heading)
    function region_col ( p_region in apex_plugin.t_region, p_name in varchar2 ) return apex_plugin.t_region_column
    is
        l_none apex_plugin.t_region_column;
    begin
        for i in 1 .. p_region.region_columns.count loop
            if upper(p_region.region_columns(i).name) = upper(p_name) then
                return p_region.region_columns(i);
            end if;
        end loop;
        return l_none;
    end region_col;

    -- Node ID, Title and Parent ID (or Level) are required
    function roles_ok return boolean
    is
    begin
        return g_roles.exists('id') and g_roles.exists('title')
           and (g_roles.exists('parent') or g_roles.exists('level'));
    end roles_ok;

    ----------------------------------------------------------------------------
    -- fetching
    ----------------------------------------------------------------------------
    function col_index ( p_name in varchar2 ) return pls_integer
    is
    begin
        if p_name is null or g_names is null then
            return null;
        end if;
        for j in 1 .. g_names.count loop
            if g_names(j) = p_name then
                return j;
            end if;
        end loop;
        return null;
    end col_index;

    function cell ( p_ctx in apex_exec.t_context, p_j in pls_integer ) return varchar2
    is
    begin
        if g_masks(p_j) is not null and g_types(p_j) = to_char(apex_exec.c_data_type_number) then
            return trim(to_char(apex_exec.get_number(p_ctx, p_j), g_masks(p_j)));
        elsif g_masks(p_j) is not null and g_types(p_j) = to_char(apex_exec.c_data_type_date) then
            return to_char(apex_exec.get_date(p_ctx, p_j), g_masks(p_j));
        elsif g_types(p_j) = to_char(apex_exec.c_data_type_clob) then
            return dbms_lob.substr(apex_exec.get_clob(p_ctx, p_j), 8000, 1);
        end if;
        return apex_exec.get_varchar2(p_ctx, p_j);
    end cell;

    -- runs the region source (with extra filters) and appends the rows to p_rows
    procedure fetch_rows (
        p_region  in            apex_plugin.t_region,
        p_filters in            apex_exec.t_filters,
        p_max     in            pls_integer,
        p_rows    in out nocopy t_rows,
        p_more    in out        boolean )
    is
        l_ctx apex_exec.t_context;
        l_col apex_exec.t_column;
        l_n   pls_integer;
    begin
        l_ctx := apex_region.open_query_context(
                     p_page_id            => v('APP_PAGE_ID'),
                     p_region_id          => p_region.id,
                     p_additional_filters => p_filters,
                     p_max_rows           => p_max + 1 );
        if g_names is null then
            g_names := apex_t_varchar2();
            g_types := apex_t_varchar2();
            g_masks := apex_t_varchar2();
            for j in 1 .. apex_exec.get_column_count(l_ctx) loop
                l_col := apex_exec.get_column(l_ctx, j);
                g_names.extend; g_types.extend; g_masks.extend;
                g_names(j) := upper(l_col.name);
                g_types(j) := to_char(l_col.data_type);
                for i in 1 .. p_region.region_columns.count loop
                    if upper(p_region.region_columns(i).name) = g_names(j) then
                        g_masks(j) := p_region.region_columns(i).format_mask;
                    end if;
                end loop;
            end loop;
        end if;
        while apex_exec.next_row(l_ctx) loop
            if p_rows.count >= p_max then
                p_more := true;
                exit;
            end if;
            l_n := p_rows.count + 1;
            for j in 1 .. g_names.count loop
                p_rows(l_n)(j) := cell(l_ctx, j);
            end loop;
        end loop;
        apex_exec.close(l_ctx);
    exception
        when others then
            apex_exec.close(l_ctx);
            raise;
    end fetch_rows;

    -- rows whose p_column is one of p_values (chunked IN lists)
    procedure fetch_in (
        p_region in            apex_plugin.t_region,
        p_column in            varchar2,
        p_values in            apex_t_varchar2,
        p_max    in            pls_integer,
        p_rows   in out nocopy t_rows,
        p_more   in out        boolean )
    is
        l_filters apex_exec.t_filters;
        l_chunk   apex_t_varchar2;
        i         pls_integer := 1;
    begin
        while i <= p_values.count and not p_more loop
            l_chunk := apex_t_varchar2();
            for k in i .. least(i + c_in_chunk - 1, p_values.count) loop
                l_chunk.extend;
                l_chunk(l_chunk.count) := p_values(k);
            end loop;
            l_filters.delete;
            apex_exec.add_filter(
                p_filters     => l_filters,
                p_filter_type => apex_exec.c_filter_in,
                p_column_name => p_column,
                p_values      => l_chunk );
            fetch_rows(p_region, l_filters, p_max, p_rows, p_more);
            i := i + c_in_chunk;
        end loop;
    end fetch_in;

    -- number of children of every id in p_rows (lazy loading), so closed nodes show
    -- their count before they are opened - counted here, nothing for the developer to add
    procedure child_counts (
        p_region in            apex_plugin.t_region,
        p_rows   in            t_rows,
        p_from   in            pls_integer,
        p_counts in out nocopy t_num_map )
    is
        l_id_j  pls_integer := col_index(g_roles('id'));
        l_pid_j pls_integer := col_index(g_roles('parent'));
        l_ids   apex_t_varchar2 := apex_t_varchar2();
        l_kids  t_rows;
        l_more  boolean := false;
        l_p     varchar2(4000);
    begin
        for i in p_from .. p_rows.count loop
            l_ids.extend;
            l_ids(l_ids.count) := p_rows(i)(l_id_j);
            p_counts(p_rows(i)(l_id_j)) := 0;
        end loop;
        if l_ids.count = 0 then
            return;
        end if;
        fetch_in(p_region, g_roles('parent'), l_ids, 200000, l_kids, l_more);
        for i in 1 .. l_kids.count loop
            l_p := l_kids(i)(l_pid_j);
            if l_p is not null and p_counts.exists(l_p) then
                p_counts(l_p) := p_counts(l_p) + 1;
            end if;
        end loop;
    end child_counts;

    -- the rows for p_ids plus every ancestor, ordered root first
    procedure fetch_path (
        p_region in            apex_plugin.t_region,
        p_ids    in            apex_t_varchar2,
        p_out    in out nocopy t_rows )
    is
        type t_gens is table of t_rows index by pls_integer;
        l_gens  t_gens;
        l_need  apex_t_varchar2 := p_ids;
        l_seen  t_num_map;
        l_rows  t_rows;
        l_more  boolean := false;
        l_id_j  pls_integer := col_index(g_roles('id'));
        l_pid_j pls_integer := col_index(g_roles('parent'));
        l_p     varchar2(4000);
        l_n     pls_integer;
    begin
        for g in 1 .. 64 loop
            exit when l_need is null or l_need.count = 0;
            l_rows.delete;
            fetch_in(p_region, g_roles('id'), l_need, 5000, l_rows, l_more);
            exit when l_rows.count = 0;
            l_need := apex_t_varchar2();
            for i in 1 .. l_rows.count loop
                l_seen(l_rows(i)(l_id_j)) := 1;
            end loop;
            for i in 1 .. l_rows.count loop
                l_p := l_rows(i)(l_pid_j);
                if l_p is not null and not l_seen.exists(l_p) then
                    l_seen(l_p) := 0;
                    l_need.extend;
                    l_need(l_need.count) := l_p;
                end if;
            end loop;
            l_gens(g) := l_rows;
        end loop;
        for g in reverse 1 .. l_gens.count loop
            for i in 1 .. l_gens(g).count loop
                l_n := p_out.count + 1;
                p_out(l_n) := l_gens(g)(i);
            end loop;
        end loop;
    end fetch_path;

    ----------------------------------------------------------------------------
    -- JSON response
    ----------------------------------------------------------------------------
    procedure write_response (
        p_rows   in t_rows,
        p_more   in boolean,
        p_counts in t_num_map,
        p_ids    in apex_t_varchar2 default null )
    is
        l_k varchar2(4000);
    begin
        g_buf := null;
        prn('{"cols":[');
        for j in 1 .. g_names.count loop
            prn(case when j > 1 then ',' end || js(g_names(j)));
        end loop;
        if g_link is not null then
            prn(',' || js(c_link_col));
        end if;
        prn('],"rows":[');
        for i in 1 .. p_rows.count loop
            prn(case when i > 1 then ',' end || '[');
            for j in 1 .. g_names.count loop
                prn(case when j > 1 then ',' end || js(p_rows(i)(j)));
            end loop;
            if g_link is not null then
                prn(',' || js(row_link(p_rows(i))));
            end if;
            prn(']');
        end loop;
        prn(']');
        if p_more then
            prn(',"truncated":true');
        end if;
        if p_counts.count > 0 then
            prn(',"counts":{');
            l_k := p_counts.first;
            while l_k is not null loop
                prn(case when l_k <> p_counts.first then ',' end || js(l_k) || ':' || p_counts(l_k));
                l_k := p_counts.next(l_k);
            end loop;
            prn('}');
        end if;
        if p_ids is not null then
            prn(',"ids":[');
            for i in 1 .. p_ids.count loop
                prn(case when i > 1 then ',' end || js(p_ids(i)));
            end loop;
            prn(']');
        end if;
        prn('}');
        flush;
    end write_response;

    procedure write_error ( p_message in varchar2 )
    is
    begin
        sys.htp.prn('{"error":' || js(p_message) || '}');
    end write_error;

    ----------------------------------------------------------------------------
    -- photo download for the Image BLOB Query attribute
    ----------------------------------------------------------------------------
    procedure send_image ( p_region in apex_plugin.t_region )
    is
        l_params apex_exec.t_parameters;
        l_ctx    apex_exec.t_context;
        l_blob   blob;
        l_mime   varchar2(255);
    begin
        apex_exec.add_parameter(l_params, 'NODE_ID', apex_application.g_x02);
        l_ctx := apex_exec.open_query_context(
                     p_location       => apex_exec.c_location_local_db,
                     p_sql_query      => ra(p_region, 47),
                     p_sql_parameters => l_params,
                     p_max_rows       => 1 );
        if apex_exec.next_row(l_ctx) then
            l_blob := apex_exec.get_blob(l_ctx, 1);
            if apex_exec.get_column_count(l_ctx) > 1 then
                l_mime := apex_exec.get_varchar2(l_ctx, 2);
            end if;
        end if;
        apex_exec.close(l_ctx);
        if l_blob is null or dbms_lob.getlength(l_blob) = 0 then
            -- no photo: a transparent pixel, so the initials under it show (no 404 in the console)
            l_blob := to_blob(hextoraw('47494638396101000100800000000000FFFFFF21F90401000000002C00000000010001000002024401003B'));
            l_mime := 'image/gif';
        end if;
        sys.owa_util.mime_header(nvl(l_mime, 'image/jpeg'), false);
        sys.htp.p('Content-Length: ' || dbms_lob.getlength(l_blob));
        sys.htp.p('Cache-Control: private, max-age=3600');
        sys.owa_util.http_header_close;
        sys.wpg_docload.download_file(l_blob);
    exception
        when others then
            apex_exec.close(l_ctx);
            raise;
    end send_image;

    ----------------------------------------------------------------------------
    -- render
    ----------------------------------------------------------------------------
    procedure render (
        p_region in            apex_plugin.t_region,
        p_plugin in            apex_plugin.t_plugin,
        p_param  in            apex_plugin.t_region_render_param,
        p_result in out nocopy apex_plugin.t_region_render_result )
    is
        l_id       varchar2(255) := region_dom_id(p_region);
        l_col      apex_plugin.t_region_column;
        l_opts     varchar2(4000) := nvl(ra(p_region, 24), c_default_options);
        l_tb       varchar2(4000) := nvl(ra(p_region, 42), c_default_toolbar);
        l_content  varchar2(4000) := nvl(ra(p_region, 22), c_default_content);
        l_views    apex_t_varchar2 := apex_string.split(nvl(ra(p_region, 20), c_all_views), ':');
        l_json     clob;
        l_msg      varchar2(4000);
        l_tbl      apex_t_varchar2;
        c_msgs     constant apex_t_varchar2 := apex_t_varchar2(
            'CHART','SEARCH','CLEAR','NO_DATA','NO_MATCH','MATCHES','PREV','NEXT','ZOOM_IN','ZOOM_OUT',
            'FIT','RESET','EXPAND_ALL','COLLAPSE_ALL','LAYOUT','STYLE','EXPORT','FULLSCREEN','EXIT_FULLSCREEN',
            'PNG','SVG','PRINT','OPEN','FOCUS','EXPAND_BRANCH','COLLAPSE_BRANCH','HIGHLIGHT_PATH','SHOW_BRANCH',
            'ALL','MORE','MORE_FIELDS','LESS','UNASSIGNED','LEVEL','CTRL_ZOOM','LOADING','ERROR','TEAM',
            'COLLAPSE','EXPAND','TB','BT','LR','RL','RADIAL','S_AVATAR','S_CLASSIC','S_DETAILED','S_PILL',
            'S_BUBBLE','S_HEADER','S_MINIMAL','S_BADGE','S_PHOTO','S_CUSTOM','ONLY_HL','SHOW_ALL','NO_HL',
            'HL_BRANCH','CUSTOMIZE','CLOSE','C_STYLE','C_LAYOUT','C_CONNECTOR','C_LEAF','C_SIZE','C_WIDTH',
            'C_HGAP','C_VGAP','C_LOOK','C_COMPACT','C_ROUNDED','C_SHADOW','C_PHOTOS','C_ACCENT','C_HLCOLOR',
            'C_THEME','C_SHOW','C_LEGEND','C_MINIMAP','C_BANDS','C_RESET','C_SAVED','CN_ROUNDED','CN_ELBOW',
            'CN_CURVED','CN_STRAIGHT','LF_AUTO','LF_ROW','LF_STACK','LF_GRID','DETAILS','C_CONTENT',
            'C_SUBTITLE','C_BADGE','C_STATUS','C_TOTALS','C_BODY','C_FOOTER','C_NOT_IN_VIEW','C_MORE','NO_COLUMNS');
        l_key      varchar2(30);
        l_mode     varchar2(30) := customize_mode(p_region);
        l_prefs    varchar2(4000);
    begin
        sys.htp.p('<div id="' || apex_escape.html_attribute(l_id) || '_hcp" class="hcp-host"></div>');

        resolve_roles(p_region);

        apex_json.initialize_clob_output;
        apex_json.open_object;
        apex_json.write('ajaxId', apex_plugin.get_ajax_identifier);
        apex_json.write('itemsToSubmit', apex_plugin_util.page_item_names_to_jquery(p_region.ajax_items_to_submit));

        -- the columns chosen in the Columns group; the chart refuses to guess any of them
        apex_json.open_object('roles');
        l_key := g_roles.first;
        while l_key is not null loop
            apex_json.write(l_key, g_roles(l_key));
            l_key := g_roles.next(l_key);
        end loop;
        if ra(p_region, 35) is not null then
            apex_json.write('link', c_link_col);
        end if;
        apex_json.close_object;

        -- the body: Body Columns 1-4, labelled with their Heading
        apex_json.open_array('fields');
        for n in 15 .. 18 loop
            if ra(p_region, n) is not null then
                l_col := region_col(p_region, ra(p_region, n));
                apex_json.open_object;
                apex_json.write('c', upper(ra(p_region, n)));
                apex_json.write('l', nvl(l_col.heading, initcap(replace(ra(p_region, n), '_', ' '))));
                apex_json.close_object;
            end if;
        end loop;
        apex_json.close_array;
        if ra(p_region, 13) is not null then
            l_col := region_col(p_region, ra(p_region, 13));
            apex_json.write('footerLabel', nvl(l_col.heading, initcap(replace(ra(p_region, 13), '_', ' '))));
        end if;

        apex_json.open_array('rawHtml');
        for i in 1 .. p_region.region_columns.count loop
            if not nvl(p_region.region_columns(i).escape_output, true) then
                apex_json.write(upper(p_region.region_columns(i).name));
            end if;
        end loop;
        apex_json.close_array;

        apex_json.write('style',         nvl(ra(p_region, 19), 'AVATAR'));
        apex_json.open_array('views');
        for i in 1 .. l_views.count loop
            apex_json.write(l_views(i));
        end loop;
        apex_json.close_array;
        apex_json.write('template',      ra(p_region, 21));
        apex_json.write('showSubtitle',  has(l_content, 'subtitle'));
        apex_json.write('showBadge',     has(l_content, 'badge'));
        apex_json.write('showStatus',    has(l_content, 'status'));
        apex_json.write('showTotals',    has(l_content, 'totals'));
        apex_json.write('showBody',      has(l_content, 'body'));
        apex_json.write('showFooter',    has(l_content, 'footer'));
        apex_json.write('orientation',   nvl(ra(p_region, 25), 'TB'));
        apex_json.write('connector',     nvl(ra(p_region, 26), 'ROUNDED'));
        apex_json.write('leafLayout',    nvl(ra(p_region, 27), 'AUTO'));
        if num(ra(p_region, 28), null) is not null then
            apex_json.write('nodeWidth', num(ra(p_region, 28), null));
        end if;
        apex_json.write('siblingGap',    num(ra(p_region, 29), 24));
        apex_json.write('levelGap',      num(ra(p_region, 30), 56));
        apex_json.write('shadow',        has(l_opts, 'shadow'));
        apex_json.write('rounded',       has(l_opts, 'rounded'));
        apex_json.write('compact',       has(l_opts, 'compact'));
        apex_json.write('photos',        has(l_opts, 'photos'));
        apex_json.write('contextMenu',   has(l_opts, 'contextMenu'));
        apex_json.write('rememberState', has(l_opts, 'rememberState'));
        apex_json.write('lazy',          has(l_opts, 'lazy') and g_roles.exists('parent'));
        apex_json.write('miniMap',       has(l_opts, 'miniMap'));
        apex_json.write('legend',        has(l_opts, 'legend'));
        apex_json.write('levelBands',    has(l_opts, 'levelBands'));
        apex_json.write('pathSubtree',   has(l_opts, 'pathSubtree'));
        apex_json.write('ctrlWheel',     has(l_opts, 'ctrlWheel'));
        apex_json.write('animate',       has(l_opts, 'animate'));
        apex_json.open_array('toolbar');
        if l_tb <> 'none' then
            l_tbl := apex_string.split(l_tb, ':');
            for i in 1 .. l_tbl.count loop
                if l_tbl(i) <> 'none' then
                    apex_json.write(l_tbl(i));
                end if;
            end loop;
        end if;
        apex_json.close_array;
        apex_json.write('initialLevels', num(ra(p_region, 31), 2));
        apex_json.write('maxChildren',   greatest(num(ra(p_region, 32), 50), 1));
        apex_json.write('orphans',       nvl(ra(p_region, 33), 'ROOT'));
        apex_json.write('onClick',       nvl(ra(p_region, 34), 'AUTO'));
        apex_json.write('linkAttributes', ra(p_region, 36));
        apex_json.write('clickItem',     ra(p_region, 37));
        apex_json.write('highlightPath', nvl(ra(p_region, 38), 'CLICK'));
        apex_json.write('highlightColor', ra(p_region, 40));
        apex_json.write('heightMode',    nvl(ra(p_region, 44), 'VIEWPORT'));
        apex_json.write('height',        num(ra(p_region, 45), 600));
        apex_json.write('initialView',   nvl(ra(p_region, 46), 'FIT'));
        apex_json.write('imageBlob',     ra(p_region, 47) is not null);
        apex_json.write('rollupLabel',   ra(p_region, 48));
        apex_json.write('customize',     l_mode);
        apex_json.write('prefsKey',      v('APP_ID') || ':' || v('APP_PAGE_ID') || ':' || prefs_key(p_region));
        if l_mode = 'DATABASE' then
            l_prefs := load_prefs(p_region);
            if l_prefs is not null then
                apex_json.write_raw('prefs', l_prefs); -- rebuilt from known keys by clean_prefs
            end if;
        end if;
        apex_json.write('maxNodes',      c_max_rows);
        apex_json.write('noDataMessage', p_region.no_data_found_message);
        apex_json.write('fileName',      nvl(regexp_replace(p_region.name, '[^[:alnum:]_-]+', '_'), 'hierarchy'));

        -- translatable UI text: only messages that exist (HCP.<KEY>) are sent
        apex_json.open_object('msg');
        for i in 1 .. c_msgs.count loop
            l_msg := apex_lang.message('HCP.' || c_msgs(i));
            if l_msg is not null and l_msg <> 'HCP.' || c_msgs(i) then
                apex_json.write(c_msgs(i), l_msg);
            end if;
        end loop;
        apex_json.close_object;
        apex_json.close_object;

        l_json := apex_json.get_clob_output;
        apex_json.free_output;

        apex_javascript.add_onload_code(
            p_code => 'hierarchyChartPro.init(' || apex_javascript.add_value(l_id, false) || ','
                      || dbms_lob.substr(l_json, 32000, 1) || ','
                      || nvl(trim(p_region.init_javascript_code), 'null') || ');' );
    end render;

    ----------------------------------------------------------------------------
    -- AJAX
    ----------------------------------------------------------------------------
    procedure ajax (
        p_region in            apex_plugin.t_region,
        p_plugin in            apex_plugin.t_plugin,
        p_param  in            apex_plugin.t_region_ajax_param,
        p_result in out nocopy apex_plugin.t_region_ajax_result )
    is
        l_req      varchar2(30) := upper(apex_application.g_x01);
        l_opts     varchar2(4000) := nvl(ra(p_region, 24), c_default_options);
        l_max      pls_integer := c_max_rows;
        l_rows     t_rows;
        l_more     boolean := false;
        l_counts   t_num_map;
        l_filters  apex_exec.t_filters;
        l_ids      apex_t_varchar2;
        l_hits     apex_t_varchar2;
        l_from     pls_integer;
        l_level    t_rows;
        l_id_j     pls_integer;
        l_seen     t_num_map;
        l_n        pls_integer;
        l_lazy     boolean;
    begin
        g_names := null;
        resolve_roles(p_region);
        l_lazy := has(l_opts, 'lazy') and g_roles.exists('parent');

        if l_req = 'IMG' then
            if ra(p_region, 47) is not null then
                send_image(p_region);
            end if;
            return;
        end if;

        sys.owa_util.mime_header('application/json', false);
        sys.htp.p('Cache-Control: no-cache');
        sys.owa_util.http_header_close;

        if l_req <> 'PREFS' and not roles_ok then
            write_error('Choose the Node ID, Title and Parent ID (or Level) columns of this region.');
            return;
        end if;

        if l_req = 'PREFS' then
            -- the signed-in user's customization (empty = back to the developer's settings)
            if customize_mode(p_region) = 'DATABASE' then
                save_prefs(p_region, apex_application.g_x02);
                sys.htp.prn('{"ok":true}');
            else
                write_error('User Customization is not saved on the server for this region.');
            end if;
            return;
        end if;

        init_link(p_region);

        if l_req = 'DATA' and not l_lazy then
            fetch_rows(p_region, l_filters, l_max, l_rows, l_more);
            write_response(l_rows, l_more, l_counts);

        elsif l_req = 'DATA' then
            -- roots, then one IN query per level down to Initial Expand Levels
            apex_exec.add_filter(
                p_filters     => l_filters,
                p_filter_type => apex_exec.c_filter_null,
                p_column_name => g_roles('parent') );
            fetch_rows(p_region, l_filters, l_max, l_rows, l_more);
            l_id_j := col_index(g_roles('id'));
            l_from := 1;
            for lv in 2 .. greatest(num(ra(p_region, 31), 2), 1) loop
                exit when l_from > l_rows.count or l_more;
                l_ids := apex_t_varchar2();
                for i in l_from .. l_rows.count loop
                    l_ids.extend;
                    l_ids(l_ids.count) := l_rows(i)(l_id_j);
                end loop;
                l_from := l_rows.count + 1;
                fetch_in(p_region, g_roles('parent'), l_ids, l_max, l_rows, l_more);
            end loop;
            child_counts(p_region, l_rows, 1, l_counts);
            write_response(l_rows, l_more, l_counts);

        elsif l_req = 'CHILDREN' then
            l_ids := apex_t_varchar2();
            for i in 1 .. apex_application.g_f01.count loop
                l_ids.extend;
                l_ids(l_ids.count) := apex_application.g_f01(i);
            end loop;
            l_rows.delete;
            fetch_rows(p_region, l_filters, 0, l_rows, l_more); -- column metadata only
            l_more := false;
            fetch_in(p_region, g_roles('parent'), l_ids, l_max, l_rows, l_more);
            child_counts(p_region, l_rows, 1, l_counts);
            write_response(l_rows, l_more, l_counts);

        elsif l_req = 'PATH' then
            l_ids := apex_t_varchar2();
            for i in 1 .. apex_application.g_f01.count loop
                l_ids.extend;
                l_ids(l_ids.count) := apex_application.g_f01(i);
            end loop;
            fetch_rows(p_region, l_filters, 0, l_rows, l_more);
            l_more := false;
            fetch_path(p_region, l_ids, l_rows);
            child_counts(p_region, l_rows, 1, l_counts);
            write_response(l_rows, false, l_counts);

        elsif l_req = 'SEARCH' then
            -- matches on title, then subtitle; at most 50, returned with their ancestors
            fetch_rows(p_region, l_filters, 0, l_rows, l_more);
            l_more := false;
            l_id_j := col_index(g_roles('id'));
            l_hits := apex_t_varchar2();
            for r in 1 .. 2 loop
                exit when l_hits.count >= 50;
                if r = 1 or g_roles.exists('subtitle') then
                    l_filters.delete;
                    apex_exec.add_filter(
                        p_filters     => l_filters,
                        p_filter_type => apex_exec.c_filter_contains,
                        p_column_name => case r when 1 then g_roles('title') else g_roles('subtitle') end,
                        p_value       => apex_application.g_x02 );
                    l_level.delete;
                    l_more := false;
                    fetch_rows(p_region, l_filters, 50, l_level, l_more);
                    for i in 1 .. l_level.count loop
                        if not l_seen.exists(l_level(i)(l_id_j)) and l_hits.count < 50 then
                            l_seen(l_level(i)(l_id_j)) := 1;
                            l_hits.extend;
                            l_hits(l_hits.count) := l_level(i)(l_id_j);
                        end if;
                    end loop;
                end if;
            end loop;
            l_rows.delete;
            if l_hits.count > 0 then
                fetch_path(p_region, l_hits, l_rows);
                child_counts(p_region, l_rows, 1, l_counts);
            end if;
            write_response(l_rows, false, l_counts, l_hits);
        else
            write_error('Unknown request ' || l_req);
        end if;
    exception
        when others then
            apex_debug.error('Hierarchy Pro %s: %s', l_req, sqlerrm);
            write_error(case when apex_application.g_debug then sqlerrm else 'The chart data could not be loaded.' end);
    end ajax;

end hierarchy_chart_plugin_pkg;
/
