# 12 — Automated Codebase Improvement Recommendations Panel

**What to build:** Implement a heuristic diagnostic engine evaluating structural weaknesses (circular dependencies, god modules/components, excessive fan-in/fan-out coupling bottlenecks, dead/orphan code, and module cohesion), and present a dedicated "Opportunities for Improvement" recommendations panel with interactive graph highlights, refactoring recipes, and Markdown export.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 05 — Code Complexity Metrics & Health Heatmap

**Status:** ready-for-agent

- [ ] Recommender engine detects circular dependency chains and suggests interface/type extraction or dependency inversion strategies.
- [ ] Engine identifies god files (excessive LOC, complexity, or high fan-out) and recommends component decomposition.
- [ ] Engine flags coupling bottleneck files (high fan-in/fan-out) and suggests mediator or facade patterns.
- [ ] Dead and orphan files (zero incoming and outgoing edges) are flagged.
- [ ] Misplaced files with weak module cohesion are identified based on cross-directory import concentrations.
- [ ] Dedicated "Recommendations" tab presents findings categorized by severity (High, Medium, Low) with actionable counts.
- [ ] Clicking a recommendation highlights the affected nodes and dependency paths in Cytoscape.js and displays step-by-step refactoring advice.
- [ ] Recommendations can be exported as a formatted Markdown or JSON report for backlog planning.
