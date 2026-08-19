# 10 — Visual Codebase Diff (Two-Version Architecture Comparison)

**What to build:** Allow developers to upload two distinct versions or branches of a repository (Base vs. Target ZIP), automatically compute architectural deltas across files and dependencies, and render a side-by-side visual diff highlighting added, removed, and modified nodes and edges.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 03 — SVG Diagram Export & Advanced Graph Filtering

**Status:** ready-for-agent

- [ ] Upload dropzone supports a "Compare Two Versions" dual-ZIP mode (e.g. Base/Main vs Target/Branch).
- [ ] Worker pipeline computes graph diffs, identifying added nodes/edges (green), removed nodes/edges (red), and modified files (yellow/amber).
- [ ] Dependency Graph provides a "Diff View" overlay rendering the comparative graph with clear visual diff indicators.
- [ ] Treemap view supports a side-by-side delta visualization illustrating file size changes between versions.
- [ ] A "Structural Impact Summary" card lists net changes: added/removed files, new circular dependencies introduced, and overall coupling delta.
