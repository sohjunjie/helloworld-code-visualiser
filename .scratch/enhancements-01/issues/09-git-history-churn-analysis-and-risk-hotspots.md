# 09 — Git History Churn Analysis & Risk Hotspots Treemap Overlay

**What to build:** Introduce client-side behavioral code analysis by allowing users to provide Git churn history logs (`git log --numstat`), correlate commit frequency and churn volume with structural cyclomatic complexity, and render an interactive risk hotspot heatmap overlay over the D3 treemap.

**Blocked by:** 05 — Code Complexity Metrics & Health Heatmap

**Status:** ready-for-agent

- [ ] Dropzone and header provide an option to attach Git commit log output (via pasted text or `.log` file upload generated from `git log --numstat`).
- [ ] Parser extracts commit frequency, lines added/deleted, and churn rates per file entirely in the browser.
- [ ] D3 Treemap view provides a "Risk Hotspots" visual mode that overlays high churn and high complexity metrics (highlighting high-risk maintenance hotspots).
- [ ] Architecture view includes a "Top 10 Risk Hotspots" list ranking files by churn-complexity risk scores with direct navigation to graph nodes.
