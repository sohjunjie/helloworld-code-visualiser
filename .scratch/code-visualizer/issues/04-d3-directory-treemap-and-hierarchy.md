# 04 — Interactive Directory Treemap & Hierarchy Visualizer (D3.js)

**What to build:** An interactive D3.js powered folder hierarchy visualizer and file size treemap in Tab 1. Displays relative file size weights, file extension color-coding, hover tooltips with file metadata, and drill-down zooming into nested subdirectories.

**Blocked by:** 03 — JS/TS AST Parsing Engine & Module Dependency Graph Generator

**Status:** completed

- [x] D3.js treemap layout algorithm renders file and folder nodes proportional to file size and file count.
- [x] Color-coding scheme visually distinguishes file types (`.ts`, `.tsx`, `.js`, `.css`, `.json`, etc.).
- [x] Interactive zoom drill-down enables clicking a folder node to expand and focus on its sub-contents.
- [x] Hover tooltips display file path, line count, byte size, and import count details.
- [x] Responsive canvas redraws smoothly on container size changes.
