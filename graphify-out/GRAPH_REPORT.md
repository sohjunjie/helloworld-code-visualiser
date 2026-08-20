# Graph Report - helloworld-code-visualiser  (2026-08-21)

## Corpus Check
- 71 files · ~144,324 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 415 nodes · 686 edges · 43 communities (20 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c158b415`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.service.ts
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
- code-visualizer.models.ts
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
- HeaderComponent
- ast-parser.ts
- app.ts
- visualizer-store.service.ts
- UploadDropzoneComponent
- ArchitectureViewComponent
- InspectorSidebarComponent

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 43 edges
2. `ThemeService` - 32 edges
3. `DependencyGraphViewComponent` - 26 edges
4. `CodeFileNode` - 22 edges
5. `TreemapViewComponent` - 18 edges
6. `buildAndParseGraph()` - 14 edges
7. `ExportDemoService` - 13 edges
8. `HeaderComponent` - 11 edges
9. `compilerOptions` - 11 edges
10. `parseFileContents()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `VisualizerStoreService` --references--> `ThemeService`  [EXTRACTED]
  src/app/services/visualizer-store.service.ts → src/app/services/theme.service.ts
- `buildAndParseGraph()` --calls--> `parseFileContents()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/ast-parser.ts
- `buildAndParseGraph()` --calls--> `detectSoftwarePatterns()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/pattern-detector.ts
- `calculateStats()` --calls--> `analyzeCodeHealth()`  [EXTRACTED]
  src/app/workers/graph-builder.ts → src/app/workers/health-analyzer.ts
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts

## Import Cycles
- None detected.

## Communities (43 total, 23 thin omitted)

### Community 0 - "theme.service.ts"
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
Cohesion: 0.17
Nodes (20): UploadProgress, buildAndParseGraph(), isWorkerContext(), processDemoFiles(), processZipFile(), reportProgress(), findCircularDependencies(), buildDependencyEdges() (+12 more)

### Community 9 - "App Root Template"
Cohesion: 0.67
Nodes (3): App Root Template, App View Switcher (@switch activeTab), HTML Entry Document

### Community 10 - "CodeFileNode"
Cohesion: 0.24
Nodes (4): TreemapViewComponent, Component, ViewChild, CodeFileNode

### Community 12 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): src/test-setup.ts, src/**/*.ts, compilerOptions, types, exclude, extends, include, src/**/*.spec.ts (+1 more)

### Community 13 - "tsconfig.spec.json"
Cohesion: 0.22
Nodes (8): src/**/*.d.ts, vitest/globals, compilerOptions, types, extends, include, src/**/*.spec.ts, ./tsconfig.json

### Community 14 - "DependencyGraphViewComponent"
Cohesion: 0.11
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 15 - "code-visualizer.models.ts"
Cohesion: 0.15
Nodes (18): AggregatedGraphEdge, AggregatedGraphNode, AggregatedGraphResult, AnalysisStats, BreadcrumbItem, CodeHealthSummary, FileNodeType, GraphEdge (+10 more)

### Community 36 - "HeaderComponent"
Cohesion: 0.27
Nodes (3): HostListener, HeaderComponent, Component

### Community 37 - "ast-parser.ts"
Cohesion: 0.33
Nodes (10): AstSummary, ComplexityMetrics, calculateMaintainabilityIndex(), countLineMetrics(), estimateComplexityFromText(), JS_TS_EXTENSIONS, ParsedAstResult, parseFileContents() (+2 more)

### Community 38 - "app.ts"
Cohesion: 0.36
Nodes (4): App, Component, ProgressModalComponent, Component

### Community 41 - "ArchitectureViewComponent"
Cohesion: 0.29
Nodes (3): ArchitectureViewComponent, Component, SoftwarePatternInfo

## Knowledge Gaps
- **113 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualizerStoreService` connect `VisualizerStoreService` to `theme.service.ts`, `ThemeService`, `app.ts`, `visualizer-store.service.ts`, `UploadDropzoneComponent`, `ArchitectureViewComponent`, `CodeFileNode`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `DependencyGraphViewComponent` connect `DependencyGraphViewComponent` to `theme.service.ts`, `app.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `ThemeService` connect `ThemeService` to `theme.service.ts`, `app.ts`, `VisualizerStoreService`, `visualizer-store.service.ts`, `CodeFileNode`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._