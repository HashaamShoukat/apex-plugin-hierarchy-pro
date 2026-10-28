--------------------------------------------------------------------------------
-- Hierarchy Pro - remove the database objects
-- Delete the plug-in itself in App Builder (Shared Components > Plug-ins) first;
-- regions that still use it would fail to render without this package.
--------------------------------------------------------------------------------
set define off
whenever sqlerror continue

drop package hierarchy_chart_plugin_pkg;

-- every user's saved customization
drop table hierarchy_chart_prefs purge;

-- demo table from demo/sample_data.sql, if it was installed
drop table hcp_demo_employees purge;

prompt Done.
