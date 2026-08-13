# Specification: CodeVisualizer Web Application

## Problem Statement

Developers, software architects, and code reviewers often struggle to understand the architecture, folder structure, file size distribution, and module dependency graphs of unfamiliar or complex codebases. Existing tools are either bloated IDE extensions, command-line tools requiring complex local setup, or lack interactive visual representations for dependencies and file size hierarchies. Users need a lightweight, privacy-focused, zero-backend web application where they can upload a source code ZIP file (or select sample projects) and immediately visualize, explore, and analyze code relationships and architecture in their browser.

## Solution

CodeVisualizer is an Angular web application that runs entirely client-side. Users can upload a ZIP archive of their codebase or choose from built-in sample projects. A dedicated Web Worker decompresses the archive, parses JavaScript/JSX/TypeScript/TSX files into ASTs using `@babel/parser`, extracts module import/export relationships, and builds a comprehensive relational graph model.

The application presents this data through a multi-tab interface:
1. **Directory Treemap & Hierarchy (D3.js):** Visualizes folder structure, file counts, and relative file size weights.
2. **Dependency Network Graph (Cytoscape.js):** Renders interactive graph networks of file imports, module relationships, entry points, and circular dependencies.
3. **Architecture & Module Breakdown:** Shows high-level package/directory clusterings and dependency depth metrics.
4. **Code & AST Inspector Sidebar:** Provides source code viewing, AST node breakdown, and detailed incoming/outgoing dependency lists upon selecting any file or node.

All processing occurs client-side in the browser, ensuring full privacy and fast rendering with zero server reliance.

## User Stories

1. As a developer, I want to upload a ZIP archive of my code project, so that I can analyze its architecture without installing localized CLI tools or sending code to external servers.
2. As a new team member, I want to select pre-packaged demo codebases, so that I can explore and test the application features instantly before uploading my own projects.
3. As a software architect, I want to see real-time progress indicators (unzipping, AST parsing, graph construction), so that I know the status of processing for large codebases.
4. As a code reviewer, I want an interactive D3.js folder treemap view, so that I can identify large files, deep folder nestings, and overall project size distribution.
5. As a developer, I want an interactive Cytoscape.js dependency network graph, so that I can visualize how files import and depend on each other.
6. As a developer, I want circular dependency detection highlighted in the graph, so that I can spot structural coupling issues and refactor messy imports.
7. As a frontend developer, I want to filter and search nodes in the dependency graph by file name, directory, or file type, so that I can focus on specific modules.
8. As a developer, I want to switch graph layouts (e.g. Dagre hierarchical, COSE force-directed, concentric), so that I can view module relationships from different structural perspectives.
9. As an architect, I want an Architecture & Module Relationships view, so that I can see macro-level directory clusters and entry point dependencies.
10. As a code auditor, I want a Code & AST Inspector sidebar, so that when I click on any file node in a visualization, I can inspect its source code, AST nodes, and precise import/export references.
11. As a team lead, I want to export graph diagrams as high-resolution PNG or SVG images, so that I can include architecture diagrams in documentation and design specs.
12. As a developer, I want to export a structured JSON analysis report of the codebase, so that I can archive or programmatically process dependency metrics.
13. As a user, I want a dark and light visual theme toggle, so that I can comfortably view visualizations in different lighting environments.
14. As a user, I want fluid responsive layouts and collapsible sidebars, so that I can maximize the visual canvas space for large dependency diagrams.

## Implementation Decisions

### Modules & Architecture
- **State & Store Management:** Angular Signals for reactive state handling (active dataset, upload progress status, selected node/file filter criteria, visual display settings, and active tab index).
- **Background Execution Pipeline:** Dedicated Web Worker for JSZip extraction, AST generation with `@babel/parser`, and dependency graph data structures construction. Web Worker communicates via typed message passing (`PROGRESS_UPDATE`, `ANALYSIS_COMPLETE`, `ANALYSIS_ERROR`).
- **Graph & Visualization Services:**
  - **D3 Treemap Service:** Computes hierarchy layout, node bounding boxes, color scales by file extension, and renders responsive SVG/Canvas elements.
  - **Cytoscape Graph Service:** Manages Cytoscape instance lifecycle, styles nodes/edges, executes layouts (Dagre, COSE, Concentric), and handles node selection/hover events.
- **Parsing Engine Service:** Configures `@babel/parser` plugins (TypeScript, JSX, decorators, dynamic imports) to extract `ImportDeclaration`, `ExportNamedDeclaration`, `ExportDefaultDeclaration`, `ExportAllDeclaration`, and dynamic `import()` calls. Fallback regex scanner extracts module paths for non-JS/TS text files.
- **Demo Provider Service:** Bundles compact pre-analyzed demo projects for quick preview.

### Data Model Shapes

```typescript
type FileNodeType = 'file' | 'directory';

interface CodeFileNode {
  id: string;
  path: string;
  name: string;
  type: FileNodeType;
  size: number;
  extension: string;
  content?: string;
  imports: string[];
  exports: string[];
  astSummary?: {
    totalLines: number;
    importCount: number;
    exportCount: number;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'dynamic-import' | 're-export';
}

interface AnalysisResult {
  rootNode: CodeFileNode;
  files: Map<string, CodeFileNode>;
  edges: GraphEdge[];
  stats: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    circularDependencies: string[][];
  };
}
```

### UI Components & Styling
- Tailwind CSS custom design system for glassmorphic canvas controls, dark/light theme tokens, badge pills, custom sliders, and tab navigation bar.
- Standalone Angular Components for Header, Sidebar, Canvas Containers, Progress Indicator Modal, Code Viewer, and Export Controls.

## Testing Decisions

### Test Quality Principles
- Tests must focus on **external behavior and contracts** rather than internal implementation details.
- AST parsing logic and dependency extraction must be unit-tested against diverse JS/TS syntax patterns (ESM, CommonJS, dynamic imports, re-exports, TypeScript interfaces).
- Web Worker data transformation and message protocol must be tested to ensure correct error handling and progress updates.

### Modules to be Tested
- **AST Parsing Engine:** Verification that import/export paths, relative module resolutions, and AST summaries are correctly extracted across sample code snippets.
- **Dependency Graph Generator:** Verification that cycle detection algorithms accurately detect circular dependency loops (e.g. A $\rightarrow$ B $\rightarrow$ C $\rightarrow$ A).
- **Zip Processing Worker Pipeline:** Verification that ZIP decompression correctly ignores `node_modules`, `.git`, binary files, and hidden metadata folders.
- **Angular Signal Store & View Services:** Integration tests verifying state transitions when uploading files, switching tabs, selecting nodes, or toggling visual layout settings.

### Prior Art
- Unit tests using Vitest / Jasmine for pure parsing helper utilities.
- Component harness and DOM integration tests using Angular `@angular/core/testing` TestBed.

## Out of Scope

1. Server-side code execution, backend database storage, or user authentication.
2. Direct Git repository URL cloning (ZIP upload and local file selection are supported).
3. Full multi-language AST parsing for C++, Rust, or C# (basic fallback regex parsing applies to non-JS/TS text files).
4. Live code editing or IDE code execution features.

## Further Notes

- The project is fully client-side and can be statically hosted on GitHub Pages, Vercel, or Netlify.
- Performance optimization: For codebases exceeding 1,000 files, the Web Worker uses chunked parsing and Cytoscape Canvas-rendering fallback to ensure 60fps graph pan/zoom performance.
