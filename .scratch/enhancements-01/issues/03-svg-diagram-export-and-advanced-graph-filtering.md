# 03 — SVG Diagram Export & Advanced Graph Filtering

**What to build:** Expand the Dependency Graph toolbar to support vector SVG diagram export for high-resolution documentation, and introduce multi-criteria filtering capabilities allowing developers to filter graph nodes and edges by directory hierarchy, file type/extension, and single-node neighborhood focus mode.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**Status:** ready-for-agent

- [ ] Dependency Graph toolbar includes an SVG export action alongside PNG export that downloads a valid, scalable `.svg` diagram of the current graph layout.
- [ ] Multi-criteria filter controls allow filtering visible nodes by directory path and file extension (e.g., `.ts`, `.js`, `.css`, `.json`).
- [ ] A "Neighborhood Focus Mode" allows selecting any node to isolate and display only its direct upstream and downstream dependencies, dimming or hiding unrelated nodes.
- [ ] Filter state is managed through reactive store signals and smoothly updates Cytoscape rendering without full re-layouts.
- [ ] Active filter chips/badges indicate currently applied filters with clear one-click reset options.
