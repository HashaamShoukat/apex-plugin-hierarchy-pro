--------------------------------------------------------------------------------
-- Hierarchy Pro - database objects
-- Run as the application's parsing schema:   @install.sql
--
-- Creates table HIERARCHY_CHART_PREFS (each user's saved customization, used
-- when User Customization = "Yes - saved per user") and package
-- HIERARCHY_CHART_PLUGIN_PKG. Requires APEX 24.1 or later; on 26.1+ the
-- region's separate HTML DOM ID is used (detected here by test-compiling).
-- Safe to run again.
--------------------------------------------------------------------------------
set define off
set serveroutput on
whenever sqlerror exit failure rollback

prompt Creating HIERARCHY_CHART_PREFS ...
declare
    procedure ddl ( p_sql in varchar2 ) is
    begin
        execute immediate p_sql;
    exception
        when others then
            if sqlcode not in (-955, -2260, -2261) then -- already there
                raise;
            end if;
    end ddl;
begin
    ddl(q'[
        create table hierarchy_chart_prefs (
            app_id     number         not null,
            page_id    number         not null,
            region_key varchar2(255)  not null,
            username   varchar2(255)  not null,
            prefs      varchar2(4000),
            updated_on timestamp default systimestamp not null,
            constraint hierarchy_chart_prefs_pk primary key (app_id, page_id, region_key, username)
        )]');
end;
/

prompt Detecting the APEX plug-in API ...
declare
    l_domid boolean;

    -- true when the anonymous block compiles on this APEX release
    function compiles ( p_code in varchar2 ) return boolean
    is
    begin
        execute immediate p_code;
        return true;
    exception
        when others then
            return sqlcode <> -6550; -- PLS compile error = field not there
    end compiles;
begin
    -- 26.1+: separate HTML DOM ID of a region
    l_domid := compiles(q'[declare r apex_plugin.t_region; v varchar2(255); begin v := r.dom_id; end;]');
    execute immediate 'alter session set plsql_ccflags = ''hcp_dom_id:'
                      || case when l_domid then 'TRUE' else 'FALSE' end || '''';
    dbms_output.put_line('hcp_dom_id = ' || case when l_domid then 'TRUE' else 'FALSE' end);
end;
/

prompt Creating HIERARCHY_CHART_PLUGIN_PKG ...
@@hierarchy_chart_plugin_pkg.pks
@@hierarchy_chart_plugin_pkg.pkb

show errors package hierarchy_chart_plugin_pkg
show errors package body hierarchy_chart_plugin_pkg

alter session set plsql_ccflags = '';
prompt Done.
