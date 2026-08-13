# 03 — JS/TS AST Parsing Engine & Module Dependency Graph Generator

**What to build:** In-worker AST parsing of JavaScript/JSX/TypeScript/TSX files using `@babel/parser`. Extracts `import`, `export`, and dynamic `import()` references, resolves relative file paths, identifies circular dependencies, and outputs the unified `AnalysisResult` data model.

**Blocked by:** 02 — ZIP File Upload & Web Worker Decompression Pipeline

**Status:** ready-for-agent

- [ ] Web Worker integrates `@babel/parser` configured with TypeScript, JSX, decorators, and dynamic import syntax plugins.
- [ ] Dependency extractor resolves relative import paths (`./`, `../`, `@/` path aliases) to matching project file IDs.
- [ ] Circular dependency detection algorithm identifies import cycles (e.g. File A -> File B -> File A) and flags them in the analysis result model.
- [ ] Fallback light regex parser processes non-JS/TS text files to count lines and capture file metadata.
- [ ] Complete `AnalysisResult` payload (nodes, edges, file hierarchy, stats summary) is posted back to the main Angular application thread.
