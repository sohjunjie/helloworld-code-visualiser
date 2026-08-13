# Core Objective
A state-of-the-art web application built with Angular where users can upload project source code as a ZIP file (or select pre-loaded demo codebases) to generate interactive visualisations of folder structures, module dependencies, software architecture, and file relationship networks.

# Tech Stack & Architecture Requirements

### 1. Framework & State Management
- **Framework:** Angular 19+ (Standalone Components, Signals for state management, `@defer` loading).
- **Styling:** Tailwind CSS for dark/light themes, modern fluid layout controls, responsive sidebar panels, and sleek canvas overlays.

### 2. Visualization Engines
- **Cytoscape.js:** Used for interactive module dependency networks, import/export links, and architecture relationship graphs (using Dagre/COSE layout algorithms).
- **D3.js:** Used for folder hierarchy visualizers, file size treemaps, and indented directory trees.

### 3. Parsing & Offloading Execution Pipeline
- **Parsing Engines:** `@babel/parser` for JavaScript/JSX/TypeScript/TSX AST parsing and module dependency analysis (`import`, `require`, `export` graph extraction), alongside fallback regex/light parsing for non-JS files.
- **Offloading Pipeline:** Dedicated **Web Worker** handling JSZip decompression, AST parsing, and graph node/edge construction asynchronously without blocking the UI thread. Emits real-time progress steps (`Unzipping %` -> `AST Parsing %` -> `Graph Building %`) to Angular Signals.

### 4. Application Workspace & View Features
- **Directory Treemap & Hierarchy (D3):** Interactive folder breakdown, file count, and file size distribution.
- **Dependency Network Graph (Cytoscape):** Node-edge layout of file imports, module dependencies, circular dependency detection, and hub highlights.
- **Architecture & Module Relationships:** High-level component/module grouping, entry point visualization, and dependency depth analysis.
- **Code & AST Inspector Sidebar:** Integrated code viewer with line highlighting, AST node explorer, and incoming/outgoing dependency list upon selecting any file node.
- **Demo Mode & Export Suite:** Built-in pre-loaded demo codebases (e.g. Express API, React App, TS Library) for instant preview, plus export options for PNG/SVG diagrams and JSON analysis reports.

