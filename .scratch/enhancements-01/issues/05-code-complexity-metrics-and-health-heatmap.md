# 05 — Code Complexity Metrics & Health Heatmap

**What to build:** Compute actionable code quality and maintainability metrics (cyclomatic complexity, lines of code vs. comment ratios, and token-based duplicate code detection) during AST analysis, render an interactive complexity heatmap on the D3 treemap, and present a "Code Health" summary dashboard in the Architecture view.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**Status:** ready-for-agent

- [ ] Worker AST traversal computes cyclomatic complexity per file by counting decision branches (`if`, `else`, `switch`, `case`, `for`, `while`, `catch`, `&&`, `||`, `??`).
- [ ] Source analysis counts lines of code (LOC), blank lines, and comment lines per file.
- [ ] D3 Treemap view provides a metric toggle allowing nodes to be sized by LOC and colored along a complexity gradient (green for low complexity to red for high complexity).
- [ ] Architecture view includes a "Code Health" summary card presenting overall maintainability index, highest complexity files, and structural hotspots.
- [ ] AST inspector sidebar displays detailed complexity metrics for the currently selected file.
