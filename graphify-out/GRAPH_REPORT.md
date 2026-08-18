# Graph Report - helloworld-code-visualiser  (2026-08-19)

## Corpus Check
- 27 files · ~8,657 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 337 edges · 23 communities (18 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `53b18e6e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VisualizerStoreService
- dependencies
- devDependencies
- package.json
- development
- compilerOptions
- analysis.worker.ts
- ArchitectureViewComponent
- App Root Template
- helloworld-code-visualiser
- tsconfig.app.json
- tsconfig.spec.json
- DependencyGraphViewComponent
- TreemapViewComponent
- UploadDropzoneComponent
- app.config.ts
- InspectorSidebarComponent
- pnpm Workspace Allow Builds Configuration

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 23 edges
2. `TreemapViewComponent` - 15 edges
3. `CodeFileNode` - 11 edges
4. `buildAndParseGraph()` - 11 edges
5. `compilerOptions` - 11 edges
6. `DependencyGraphViewComponent` - 10 edges
7. `ExportDemoService` - 9 edges
8. `helloworld-code-visualiser` - 7 edges
9. `UploadDropzoneComponent` - 7 edges
10. `development` - 6 edges

## Surprising Connections (you probably didn't know these)
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts
- `HTML Entry Document` --references--> `App Root Template`  [EXTRACTED]
  src/index.html → src/app/app.html

## Import Cycles
- None detected.

## Communities (23 total, 5 thin omitted)

### Community 0 - "VisualizerStoreService"
Cohesion: 0.09
Nodes (15): App, Component, HeaderComponent, Component, ProgressModalComponent, Component, AnalysisResult, AnalysisStats (+7 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.10
Nodes (21): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+13 more)

### Community 3 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, ng, start, test, watch (+1 more)

### Community 4 - "development"
Cohesion: 0.08
Nodes (26): build, serve, test, builder, configurations, defaultConfiguration, options, development (+18 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "analysis.worker.ts"
Cohesion: 0.22
Nodes (16): GraphEdge, buildAndParseGraph(), buildDirectoryTree(), countDirectories(), findCircularDependencies(), getBasename(), getDirname(), getFileExtension() (+8 more)

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
Cohesion: 0.28
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 15 - "TreemapViewComponent"
Cohesion: 0.27
Nodes (4): TreemapViewComponent, Component, ViewChild, CodeFileNode

## Knowledge Gaps
- **92 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VisualizerStoreService` be split into smaller, more focused modules?**
  _Cohesion score 0.09413067552602436 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `development` be split into smaller, more focused modules?**
  _Cohesion score 0.08307692307692308 - nodes in this community are weakly interconnected._