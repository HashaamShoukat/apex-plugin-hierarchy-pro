# Changelog

## 2.1.0 (2026-10-27)

- Renamed to **Hierarchy Pro**, internal name `COM.HASHAAM.HIERARCHY_PRO`. First public release on GitHub.
- Settings regrouped: **Hierarchy** (Node ID, Hierarchy Type, Parent ID / Level, Level Name), **Columns** (Title, Subtitle, Color, Badge, Legend, Body 1 - 4, Footer, Roll-up and Roll-up Label), **Images** (Icon Column, Image BLOB Query). The Advanced group is gone.
- **Photo URL Column removed** - photos come from the Image BLOB Query (URLs still work from the Initialization JavaScript Function: `o.roles.image`).
- Highlighting: **Highlight Column** and **Highlight Color Column** (were Status Column / Status Color Column); Highlight Color is now **Path Highlight Color**.
- The **footer** is a section of its own at the foot of the card, below the team and roll-up totals.
- **Custom Template** is empty by default (the sample is in its help) and the Custom view is offered only when a template is entered.
- Sideways (left-to-right) trees: the level band labels sit in a header strip that the cards pass under, and the first view starts at the top edge when the root fits.
- File URLs carry `?v=2.1.0`, so browsers load the new files instead of a cached 2.0 copy.

## 2.0.0 (2026-10-27)

Declarative and simpler. Not compatible with 1.x regions (upgrade the plug-in and the package together, then set each region's Columns).

- **Columns group**: pick Node ID, Hierarchy (Parent ID or Level), Title (required) and Subtitle, Photo URL, Icon, Color, Badge, Legend, Roll-up from the query's columns. Column aliases are no longer interpreted and the per-column Role setting is gone.
- Automatic, so no column: child counts (also with lazy loading), hover text (full title, subtitle, status), sibling order (the query's ORDER BY). Removed: Child Count, Tooltip, Sort, Expanded, CSS Class and Link columns.
- **Body Column 1 - 4** and a **Footer Column** (every view except Compact Pill) instead of per-column body flags and Fields Shown; **Level Name Column** names the level bands from the data.
- **Highlighting from the data only**: the Status Column and a new **Status Color Column** live in the Highlighting group; the Status Colors text and Highlight Node Item are gone (pick people with a page item by returning a status for them). No dot on highlighted cards - the ring and the chip show it.
- **Link Attributes** (as on a report column link, e.g. `target="_blank"`) replace Link Target.
- The Custom Template starts with a working **sample**.
- **Fixed content per view**; every view - including Compact Pill (compact numbers) and Bubble - shows the team and roll-up totals and the highlight ring and branch counter. Bubble shows the badge.
- **Default View** plus **Views Users Can Pick**; **Card Content** (subtitle, badge, status, body, footer, totals).
- Toolbar switches **Compact**, **Photos** and **Details** (body on / off; disabled on views without a body).
- Customize panel: a **Card content** section (with the body fields and their number; greyed out where the view has no place for them) and the less used settings under **More settings**.
- Clear message in the region when the required columns are not set.
- Number formatters are cached (every card shows totals now).
- Requires APEX 24.1+ (the pre-24.1 attribute code path is gone); 102 UI texts in English and Arabic.

## 1.1.0 (2026-10-27)

- **Link attribute with the Link Builder** (Behavior > Link), like a report column link: page, items from `#COLUMN#` values, clear cache, request. The URL is prepared on the server with its checksum; modal pages open as dialogs (also the APEX 24.2+ `#action$` form) and fire Dialog Closed on the region. A LINK column is no longer needed.
- **User Customization** (View > User Customization: No / saved in the browser / saved per user). A Customize panel in the toolbar changes style, layout, connectors, leaf layout, card width, spacing, compact, corners, shadows, photos, accent and highlight colour, legend, mini-map and level bands; Reset to Default. Per-user settings live in the new table `HIERARCHY_CHART_PREFS` (created by `install.sql`), are cleaned to known keys on save and load, and fall back to the browser on public pages. New event *Customization Changed*.
- **Status highlighting**: the HIGHLIGHT column takes `Y` or a status text. Statuses are coloured by the new **Status Colors** attribute (or automatically), shown as a chip on the card, counted in the legend (click to pick out one status), and counted on the toggle of closed branches.
- **Highlighted Only** toolbar toggle (and `showHighlightedOnly()`, `statusFilter()`): only highlighted nodes and their ancestors, all open.
- **Highlight Node Item** accepts several ids separated by `:` or `,` (e.g. a multi-value Popup LOV); `highlight(ids, true)` and `fitTo(ids)` zoom to show them all.
- **Two new styles**: *Badge Card* (status and every badge as chips inside the card; several badges separated with `;`) and *Photo Card* (large photo). Template tokens `&STATUS.` and `&BADGES.`.
- Image BLOB Query: a node without a photo gets a transparent pixel instead of a 404, so the initials show without console errors.
- Fit leaves room for the legend; the viewport can no longer be scrolled by focusing a card or a panel control.
- 38 new UI texts, all in English and Arabic.

## 1.0.0 (2026-10-27)

First release.

- Region plug-in with the PL/SQL package `HIERARCHY_CHART_PLUGIN_PKG`. Render and AJAX are separate, so the data is fetched by AJAX and region refresh works.
- Data from any region source. Parent / child columns, or a CONNECT BY query with LEVEL. Column roles are set automatically from the alias, or with the column's Role setting. Other columns become fields.
- Bad data never hangs the page: cycles, orphans, self-parents and duplicate ids are each handled with one console warning.
- 8 node styles, 5 orientations (mirrored on RTL pages) and 4 connector styles. Leaf teams can be stacked or gridded, and large teams are paged with a "+N more" node.
- Contour-based tidy-tree layout with variable card heights. Animated expand and collapse that keeps the clicked node still. Off-screen nodes are hidden on big trees.
- Toolbar: search with next/previous, zoom, fit / reset, expand / collapse all, orientation and style menus, PNG / SVG / Print export, and full screen.
- Path highlighting (hover or click), highlight from a page item, highlight flag column, a clickable legend, level bands, a mini-map, drill-down to one branch with a breadcrumb, and a context menu.
- Lazy loading with CHILD / PATH / SEARCH requests, optional CHILD_COUNT column, and photos from an Image BLOB Query.
- Seven Dynamic Action events, a JavaScript region API, and an Initialization JavaScript Function.
- Keyboard navigation with ARIA tree roles. English and Arabic text messages.
- Supports APEX 24.1 and later. `install.sql` detects the attribute API (24.1+) and the region DOM id (26.1+).
