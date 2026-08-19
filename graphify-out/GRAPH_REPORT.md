# Graph Report - helloworld-code-visualiser  (2026-08-20)

## Corpus Check
- 67 files · ~24,917 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 373 nodes · 582 edges · 36 communities (18 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `254bc477`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- visualizer-store.service.ts
- dependencies
- devDependencies
- ThemeService
- helloworld-code-visualiser
- compilerOptions
- analysis.worker.ts
- VisualizerStoreService
- 01-worker-modularization-and-core-testing.md
- App Root Template
- CodeFileNode
- 02-dark-light-theme-and-a11y-pass.md
- tsconfig.app.json
- tsconfig.spec.json
- DependencyGraphViewComponent
- 03-svg-diagram-export-and-advanced-graph-filtering.md
- 04-polyglot-multilanguage-import-extraction.md
- app.ts
- 05-code-complexity-metrics-and-health-heatmap.md
- 06-directory-level-dependency-aggregation-and-drill-down.md
- 07-shareable-analysis-state-url-and-hwcv-export.md
- pnpm Workspace Allow Builds Configuration
- 08-architecture-rule-validation-and-compliance-dashboard.md
- 09-git-history-churn-analysis-and-risk-hotspots.md
- 10-visual-two-version-codebase-diffing.md
- 11-realtime-local-folder-watching.md
- 12-automated-codebase-improvement-recommendations.md
- 13-interactive-annotated-code-tours.md
- 14-client-side-plugin-and-parser-extension-architecture.md
- 15-browser-local-ai-codebase-explanations.md
- 16-3d-immersive-architecture-visualizer.md
- HeaderComponent

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 37 edges
2. `ThemeService` - 24 edges
3. `DependencyGraphViewComponent` - 20 edges
4. `CodeFileNode` - 16 edges
5. `TreemapViewComponent` - 15 edges
6. `buildAndParseGraph()` - 14 edges
7. `ExportDemoService` - 13 edges
8. `HeaderComponent` - 11 edges
9. `compilerOptions` - 11 edges
10. `UploadDropzoneComponent` - 8 edges

## Surprising Connections (you probably didn't know these)
- `VisualizerStoreService` --references--> `ThemeService`  [EXTRACTED]
  src/app/services/visualizer-store.service.ts → src/app/services/theme.service.ts
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts
- `processZipFile()` --calls--> `extractZipEntries()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/zip-extractor.ts
- `buildAndParseGraph()` --calls--> `parseFileContents()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/ast-parser.ts
- `buildAndParseGraph()` --calls--> `findCircularDependencies()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/cycle-detector.ts

## Import Cycles
- None detected.

## Communities (36 total, 18 thin omitted)

### Community 0 - "visualizer-store.service.ts"
Cohesion: 0.12
Nodes (11): ThemeToggleComponent, Component, AnalysisResult, DemoProject, ExportDemoService, Injectable, GraphThemeConfig, NodeColorConfig (+3 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (31): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+23 more)

### Community 4 - "helloworld-code-visualiser"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, packageManager (+30 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "analysis.worker.ts"
Cohesion: 0.11
Nodes (29): AnalysisStats, FileNodeType, GraphEdge, PatternGrouping, UploadProgress, buildAndParseGraph(), isWorkerContext(), processDemoFiles() (+21 more)

### Community 7 - "VisualizerStoreService"
Cohesion: 0.10
Nodes (9): ArchitectureViewComponent, Component, InspectorSidebarComponent, Component, SoftwarePatternInfo, Injectable, VisualizerStoreService, formatBytes() (+1 more)

### Community 9 - "App Root Template"
Cohesion: 0.67
Nodes (3): App Root Template, App View Switcher (@switch activeTab), HTML Entry Document

### Community 10 - "CodeFileNode"
Cohesion: 0.27
Nodes (4): TreemapViewComponent, Component, ViewChild, CodeFileNode

### Community 12 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): src/test-setup.ts, src/**/*.ts, compilerOptions, types, exclude, extends, include, src/**/*.spec.ts (+1 more)

### Community 13 - "tsconfig.spec.json"
Cohesion: 0.22
Nodes (8): src/**/*.d.ts, vitest/globals, compilerOptions, types, extends, include, src/**/*.spec.ts, ./tsconfig.json

### Community 14 - "DependencyGraphViewComponent"
Cohesion: 0.14
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 18 - "app.ts"
Cohesion: 0.13
Nodes (8): App, appConfig, routes, Component, ProgressModalComponent, Component, Component, UploadDropzoneComponent

### Community 36 - "HeaderComponent"
Cohesion: 0.27
Nodes (3): HostListener, HeaderComponent, Component

## Knowledge Gaps
- **113 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualizerStoreService` connect `VisualizerStoreService` to `visualizer-store.service.ts`, `CodeFileNode`, `app.ts`, `ThemeService`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `DependencyGraphViewComponent` connect `DependencyGraphViewComponent` to `visualizer-store.service.ts`, `app.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ThemeService` connect `ThemeService` to `visualizer-store.service.ts`, `app.ts`, `VisualizerStoreService`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `visualizer-store.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._