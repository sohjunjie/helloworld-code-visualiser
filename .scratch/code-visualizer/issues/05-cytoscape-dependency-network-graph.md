# 05 — Interactive Dependency & Architecture Network Graph (Cytoscape.js)

**What to build:** Cytoscape.js graph views in Tab 2 (Dependency Graph) and Tab 3 (Architecture Map). Renders node-edge network layout of file imports, module relationships, and circular dependency loops, with configurable layouts (Dagre, COSE, Concentric), search/filter controls, and canvas pan/zoom interaction.

**Blocked by:** 03 — JS/TS AST Parsing Engine & Module Dependency Graph Generator

**Status:** ready-for-agent

- [ ] Cytoscape.js canvas initializes and renders file nodes connected by import/export directional edges.
- [ ] Layout engine switcher allows toggling between Dagre hierarchical view, COSE force-directed view, and Concentric ring view.
- [ ] Node selection highlights incoming (importers) and outgoing (dependencies) edges while dimming unrelated nodes.
- [ ] Circular dependency loops are highlighted with warning edge styling and badge counts.
- [ ] Search input and file extension filters dynamically isolate matching graph nodes.
