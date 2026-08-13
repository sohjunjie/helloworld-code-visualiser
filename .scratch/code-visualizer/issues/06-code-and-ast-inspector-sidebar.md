# 06 — Code & AST Inspector Sidebar

**What to build:** A slide-over inspector sidebar that opens when any file node is selected in D3 or Cytoscape views. Displays the file's raw source code with line numbers, AST summary metrics, and clickable lists of incoming and outgoing file dependencies.

**Blocked by:** 04 — Interactive Directory Treemap & Hierarchy Visualizer (D3.js), 05 — Interactive Dependency & Architecture Network Graph (Cytoscape.js)

**Status:** ready-for-agent

- [ ] Slide-over sidebar container slides in when a file or directory node is selected across any active view.
- [ ] Source code viewer component renders file contents with line numbering and syntax formatting.
- [ ] AST Inspector section displays total lines, import count, export count, and detected language type.
- [ ] Incoming (imported by) and Outgoing (depends on) file lists allow clicking any linked file to focus it in the canvas and sidebar.
- [ ] Close button and keyboard shortcut (Esc) hide the sidebar smoothly.
