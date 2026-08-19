# 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**What to build:** Refactor the internal Web Worker analysis pipeline by decomposing the large monolithic worker implementation into focused, single-responsibility modules (`zip-extractor.ts`, `ast-parser.ts`, `graph-builder.ts`, `cycle-detector.ts`, `pattern-detector.ts`, and a thin orchestrating `analysis.worker.ts`). Implement a comprehensive automated unit test suite covering AST parsing, cycle detection DFS algorithms, path normalization, and ZIP file filtering.

**Blocked by:** None — can start immediately

**Status:** closed

- [x] `analysis.worker.ts` is modularized into discrete, testable utilities without breaking worker messaging contracts.
- [x] Cycle detection algorithm is covered by unit tests verifying single cycles, multi-node loops (A→B→C→A), self-loops, and acyclic graphs.
- [x] Path resolution and normalization handles relative paths (`./`, `../`), index resolution (`/index.ts`), and alias extensions.
- [x] ZIP filtering logic correctly ignores ignored patterns (`node_modules`, `.git`, binary files, dist output).
- [x] Pattern detection heuristics (MVC, MVVM, Clean Architecture) are covered by unit tests.
- [x] Existing codebase visualization features (AST inspector, treemap, Cytoscape graph) continue working identically with zero regressions.
