# 06 — Directory-Level Dependency Aggregation & Drill-Down

**What to build:** Introduce high-level directory and package dependency aggregation in the Cytoscape graph view, enabling users to switch between high-level folder-to-folder architecture diagrams with weighted cross-folder edges and detailed file-level graphs with interactive drill-down navigation.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 03 — SVG Diagram Export & Advanced Graph Filtering

**Status:** ready-for-agent

- [ ] Dependency Graph provides a toggle switch between "File Level" and "Directory Level" abstraction modes.
- [ ] In Directory mode, nodes represent folders and edges represent aggregated cross-directory dependencies, with edge thickness/badges indicating import count weights.
- [ ] Clicking a directory node enables drill-down expansion, zooming into the internal file-level graph of that module while preserving contextual external boundary links.
- [ ] Breadcrumb navigation in the graph header indicates the current drill-down depth and allows one-click navigation back to parent folder levels.
- [ ] Graph layouts (Dagre, Concentric, COSE) adapt smoothly to aggregated hierarchical structures.
