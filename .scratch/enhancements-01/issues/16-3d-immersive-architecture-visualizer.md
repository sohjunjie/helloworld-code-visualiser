# 16 — 3D Immersive Architecture Visualizer Mode

**What to build:** Introduce an immersive 3D architecture visualization mode leveraging Three.js / WebGL, projecting repository directory nesting along the vertical Z-axis with 3D nodes, curved dependency arcs, orbit camera controls, and seamless switching between 2D Cytoscape and 3D visual modes.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 06 — Directory-Level Dependency Aggregation & Drill-Down

**Status:** ready-for-agent

- [ ] View navigation includes a "3D Architecture" visualizer mode toggle alongside standard 2D views.
- [ ] Three.js / WebGL canvas renders files and directories in 3D space with directory depth mapped along the vertical Z-axis.
- [ ] Dependencies are rendered as illuminated, curved 3D arcs with directional flow indicators.
- [ ] Interactive orbit controls support rotating, panning, zooming, and clicking 3D nodes to inspect node properties in the sidebar.
- [ ] Lightweight fallback or performance throttling activates gracefully on low-power devices.
