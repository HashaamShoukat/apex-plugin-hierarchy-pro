create or replace package hierarchy_chart_plugin_pkg authid definer as
--------------------------------------------------------------------------------
-- Hierarchy Pro - Oracle APEX region plug-in (render + AJAX callbacks)
--
-- Render prints an empty container and initialises the JavaScript widget with
-- the attribute settings; the data itself is fetched by the AJAX callback, so
-- region refresh (apex.region(id).refresh()) works and nothing is printed into
-- the page HTML.
--
-- AJAX requests (x01):
--   DATA      the whole tree, or the first levels when Lazy Loading is on
--   CHILDREN  f01 = parent ids  -> their children (+ grandchild counts)
--   PATH      f01 = node ids    -> those rows and all their ancestors
--   SEARCH    x02 = term        -> up to 50 matches plus their ancestors
--   IMG       x02 = node id     -> photo from the Image BLOB Query
--   PREFS     x02 = JSON        -> saves the user's customization
--
-- The columns are chosen declaratively in the region's Columns settings; Node ID,
-- Title and Parent ID (or Level) are required. APEX 24.1 or later. Compiled with
-- PLSQL_CCFLAGS 'hcp_dom_id:TRUE' on 26.1+ (separate region HTML DOM ID);
-- install.sql picks the flag automatically.
--------------------------------------------------------------------------------

    c_version constant varchar2(10) := '2.1.0';

    procedure render (
        p_region in            apex_plugin.t_region,
        p_plugin in            apex_plugin.t_plugin,
        p_param  in            apex_plugin.t_region_render_param,
        p_result in out nocopy apex_plugin.t_region_render_result );

    procedure ajax (
        p_region in            apex_plugin.t_region,
        p_plugin in            apex_plugin.t_plugin,
        p_param  in            apex_plugin.t_region_ajax_param,
        p_result in out nocopy apex_plugin.t_region_ajax_result );

end hierarchy_chart_plugin_pkg;
/
