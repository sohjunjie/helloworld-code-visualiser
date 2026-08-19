# 11 — Real-Time Local Folder Watching via File System Access API

**What to build:** Integrate the browser's File System Access API (`showDirectoryPicker`) to enable direct local directory selection and live project monitoring, automatically re-analyzing modified files incrementally to update the visualization in real time as the developer codes.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**Status:** ready-for-agent

- [ ] Dropzone provides a "Select Local Folder" button alongside standard ZIP upload on supported modern browsers.
- [ ] Direct file reading extracts local project contents without requiring ZIP compression.
- [ ] Incremental watcher monitors file handle updates and triggers targeted re-parsing of changed files without re-processing the entire workspace.
- [ ] Visualizer UI updates graphs and treemaps seamlessly when changes occur, indicating "Live Watching" status in the header.
- [ ] Browsers lacking File System Access API support display an informative message and maintain standard ZIP upload fallback.
