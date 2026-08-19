# 08 — Architecture Rule Validation & Visual Compliance Dashboard

**What to build:** Build an interactive architecture boundary validation engine allowing users to define module dependency rules (e.g., "components must not import from services directly", "domain layer cannot depend on infrastructure"), visually highlight violations in the graph with prominent styling, and track architectural compliance metrics in the Architecture view.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 03 — SVG Diagram Export & Advanced Graph Filtering

**Status:** ready-for-agent

- [ ] Architecture view provides a visual "Architecture Rules" configuration panel allowing users to define source/target module boundary constraints and disallowed dependency rules.
- [ ] Rule violations are automatically computed and highlighted as red alert edges with warning badges in the Cytoscape dependency graph.
- [ ] Architecture view displays a "Rule Compliance Summary" detailing compliance percentage, violation counts, and specific breaking import statements.
- [ ] Users can export defined architecture rule sets as JSON files and import existing rule configurations into other projects.
