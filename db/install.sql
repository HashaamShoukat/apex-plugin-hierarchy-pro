--------------------------------------------------------------------------------
-- Hierarchy Pro - database objects
-- Run as the application's parsing schema:   @install.sql
--
-- Creates table HIERARCHY_CHART_PREFS (each user's saved customization, used
-- when User Customization = "Yes - saved per user") and package
-- HIERARCHY_CHART_PLUGIN_PKG. Requires APEX 26.1 or later. Safe to run again.
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

prompt Creating HIERARCHY_CHART_PLUGIN_PKG ...
@@hierarchy_chart_plugin_pkg.pks
@@hierarchy_chart_plugin_pkg.pkb

show errors package hierarchy_chart_plugin_pkg
show errors package body hierarchy_chart_plugin_pkg

prompt Done.
