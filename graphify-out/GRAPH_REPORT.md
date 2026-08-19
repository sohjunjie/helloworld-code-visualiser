# Graph Report - helloworld-code-visualiser  (2026-08-20)

## Corpus Check
- 65 files · ~20,423 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 349 nodes · 540 edges · 36 communities (18 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f20acf25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VisualizerStoreService
- dependencies
- devDependencies
- ThemeService
- helloworld-code-visualiser
- compilerOptions
- analysis.worker.ts
- visualizer-store.service.ts
- 01-worker-modularization-and-core-testing.md
- App Root Template
- ast-parser.ts
- 02-dark-light-theme-and-a11y-pass.md
- tsconfig.app.json
- tsconfig.spec.json
- DependencyGraphViewComponent
- TreemapViewComponent
- 03-svg-diagram-export-and-advanced-graph-filtering.md
- 04-polyglot-multilanguage-import-extraction.md
- app.config.ts
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

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 33 edges
2. `ThemeService` - 21 edges
3. `CodeFileNode` - 16 edges
4. `ExportDemoService` - 14 edges
5. `buildAndParseGraph()` - 14 edges
6. `DependencyGraphViewComponent` - 13 edges
7. `TreemapViewComponent` - 13 edges
8. `compilerOptions` - 11 edges
9. `HeaderComponent` - 9 edges
10. `UploadDropzoneComponent` - 8 edges

## Surprising Connections (you probably didn't know these)
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts
- `VisualizerStoreService` --references--> `ThemeService`  [EXTRACTED]
  src/app/services/visualizer-store.service.ts → src/app/services/theme.service.ts
- `buildAndParseGraph()` --calls--> `parseFileContents()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/ast-parser.ts
- `buildAndParseGraph()` --calls--> `detectSoftwarePatterns()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/pattern-detector.ts
- `processZipFile()` --calls--> `extractZipEntries()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/zip-extractor.ts

## Import Cycles
- None detected.

## Communities (36 total, 18 thin omitted)

### Community 0 - "VisualizerStoreService"
Cohesion: 0.07
Nodes (13): App, Component, HeaderComponent, Component, ProgressModalComponent, Component, Component, UploadDropzoneComponent (+5 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (31): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+23 more)

### Community 3 - "ThemeService"
Cohesion: 0.13
Nodes (5): ThemeToggleComponent, Component, GraphThemeConfig, ThemeService, Injectable

### Community 4 - "helloworld-code-visualiser"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, packageManager (+30 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "analysis.worker.ts"
Cohesion: 0.16
Nodes (22): AnalysisStats, GraphEdge, UploadProgress, buildAndParseGraph(), isWorkerContext(), processDemoFiles(), processZipFile(), reportProgress() (+14 more)

### Community 7 - "visualizer-store.service.ts"
Cohesion: 0.17
Nodes (12): ArchitectureViewComponent, Component, InspectorSidebarComponent, Component, AnalysisResult, CodeFileNode, FileNodeType, PatternGrouping (+4 more)

### Community 9 - "App Root Template"
Cohesion: 0.67
Nodes (3): App Root Template, App View Switcher (@switch activeTab), HTML Entry Document

### Community 10 - "ast-parser.ts"
Cohesion: 0.53
Nodes (4): JS_TS_EXTENSIONS, ParsedAstResult, parseFileContents(), parseWithRegex()

### Community 12 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): src/test-setup.ts, src/**/*.ts, compilerOptions, types, exclude, extends, include, src/**/*.spec.ts (+1 more)

### Community 13 - "tsconfig.spec.json"
Cohesion: 0.22
Nodes (8): src/**/*.d.ts, vitest/globals, compilerOptions, types, extends, include, src/**/*.spec.ts, ./tsconfig.json

### Community 14 - "DependencyGraphViewComponent"
Cohesion: 0.24
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 15 - "TreemapViewComponent"
Cohesion: 0.36
Nodes (3): TreemapViewComponent, Component, ViewChild

## Knowledge Gaps
- **112 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualizerStoreService` connect `VisualizerStoreService` to `ThemeService`, `visualizer-store.service.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `ThemeService` connect `ThemeService` to `VisualizerStoreService`, `visualizer-store.service.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `CodeFileNode` connect `visualizer-store.service.ts` to `VisualizerStoreService`, `analysis.worker.ts`, `TreemapViewComponent`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VisualizerStoreService` be split into smaller, more focused modules?**
  _Cohesion score 0.06857142857142857 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._