# Graph Report - helloworld-code-visualiser  (2026-08-20)

## Corpus Check
- 61 files · ~19,303 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 333 nodes · 507 edges · 36 communities (17 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b11b436`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VisualizerStoreService
- dependencies
- devDependencies
- HeaderComponent
- development
- compilerOptions
- analysis.worker.ts
- code-visualizer.models.ts
- 01-worker-modularization-and-core-testing.md
- App Root Template
- helloworld-code-visualiser
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
1. `VisualizerStoreService` - 34 edges
2. `CodeFileNode` - 16 edges
3. `TreemapViewComponent` - 15 edges
4. `ExportDemoService` - 14 edges
5. `buildAndParseGraph()` - 14 edges
6. `DependencyGraphViewComponent` - 13 edges
7. `compilerOptions` - 11 edges
8. `HeaderComponent` - 9 edges
9. `UploadDropzoneComponent` - 8 edges
10. `AnalysisResult` - 8 edges

## Surprising Connections (you probably didn't know these)
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts
- `buildAndParseGraph()` --calls--> `detectSoftwarePatterns()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/pattern-detector.ts
- `processZipFile()` --calls--> `extractZipEntries()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/zip-extractor.ts
- `buildAndParseGraph()` --calls--> `parseFileContents()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/ast-parser.ts
- `buildAndParseGraph()` --calls--> `findCircularDependencies()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/cycle-detector.ts

## Import Cycles
- None detected.

## Communities (36 total, 19 thin omitted)

### Community 0 - "VisualizerStoreService"
Cohesion: 0.09
Nodes (12): App, Component, ProgressModalComponent, Component, Component, UploadDropzoneComponent, AnalysisResult, DemoProject (+4 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (31): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+23 more)

### Community 4 - "development"
Cohesion: 0.08
Nodes (26): build, serve, test, builder, configurations, defaultConfiguration, options, development (+18 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "analysis.worker.ts"
Cohesion: 0.13
Nodes (26): AnalysisStats, GraphEdge, UploadProgress, buildAndParseGraph(), isWorkerContext(), processDemoFiles(), processZipFile(), reportProgress() (+18 more)

### Community 7 - "code-visualizer.models.ts"
Cohesion: 0.15
Nodes (11): ArchitectureViewComponent, Component, InspectorSidebarComponent, Component, CodeFileNode, FileNodeType, PatternGrouping, SoftwarePatternInfo (+3 more)

### Community 9 - "App Root Template"
Cohesion: 0.67
Nodes (3): App Root Template, App View Switcher (@switch activeTab), HTML Entry Document

### Community 10 - "helloworld-code-visualiser"
Cohesion: 0.15
Nodes (12): packageManager, prefix, projectType, root, schematics, sourceRoot, cli, newProjectRoot (+4 more)

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
Cohesion: 0.30
Nodes (3): TreemapViewComponent, Component, ViewChild

## Knowledge Gaps
- **111 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualizerStoreService` connect `VisualizerStoreService` to `code-visualizer.models.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `CodeFileNode` connect `code-visualizer.models.ts` to `VisualizerStoreService`, `analysis.worker.ts`, `TreemapViewComponent`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VisualizerStoreService` be split into smaller, more focused modules?**
  _Cohesion score 0.08776595744680851 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._