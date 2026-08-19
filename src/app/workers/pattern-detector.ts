import {
  CodeFileNode,
  SoftwarePatternInfo,
  PatternGrouping,
} from '../models/code-visualizer.models';

export function detectSoftwarePatterns(
  fileNodes: Record<string, CodeFileNode>,
  totalFiles: number
): SoftwarePatternInfo[] {
  const patterns: SoftwarePatternInfo[] = [];
  const paths = Object.keys(fileNodes);

  // 1. Component-Based Architecture
  const componentFiles = paths.filter((p) =>
    p.includes('/components/') ||
    p.includes('/views/') ||
    p.includes('/widgets/') ||
    p.endsWith('.component.ts') ||
    p.endsWith('.component.html') ||
    p.endsWith('.component.css') ||
    p.endsWith('.jsx') ||
    p.endsWith('.tsx') ||
    p.endsWith('.vue') ||
    p.endsWith('.svelte')
  );
  if (componentFiles.length > 0) {
    const ratio = Math.min(100, Math.round((componentFiles.length / Math.max(1, totalFiles)) * 100) + 40);

    const compDirFiles = componentFiles.filter((p) => p.includes('/components/'));
    const viewDirFiles = componentFiles.filter((p) => p.includes('/views/') || p.includes('/widgets/'));
    const otherCompFiles = componentFiles.filter(
      (p) => !p.includes('/components/') && !p.includes('/views/') && !p.includes('/widgets/')
    );

    const compGroupings: PatternGrouping[] = [];
    if (compDirFiles.length > 0) {
      compGroupings.push({
        name: 'Components',
        description: 'Encapsulated UI components with templates and scoped styles',
        files: compDirFiles,
        colorClass: 'sky',
      });
    }
    if (viewDirFiles.length > 0) {
      compGroupings.push({
        name: 'Views & Widgets',
        description: 'Page-level views and reusable widget elements',
        files: viewDirFiles,
        colorClass: 'indigo',
      });
    }
    if (otherCompFiles.length > 0) {
      compGroupings.push({
        name: 'Other Component Files',
        description: 'Component files outside standard directories (JSX, TSX, Vue, Svelte)',
        files: otherCompFiles,
        colorClass: 'purple',
      });
    }

    patterns.push({
      id: 'component-based',
      name: 'Component-Based Architecture',
      category: 'UI & Frontend Structure',
      description:
        'Decomposes user interfaces into modular, encapsulated components that manage their own state and rendering logic.',
      confidence: Math.min(98, Math.max(65, ratio)),
      level: ratio > 75 ? 'High' : ratio > 45 ? 'Medium' : 'Low',
      matchingFiles: componentFiles.slice(0, 8),
      keyIndicators: [
        `${componentFiles.length} Component files detected`,
        'Encapsulated view templates & scoped component styles',
        'Hierarchical UI component tree layout',
      ],
      icon: 'cube',
      colorClass: 'sky',
      logicalGroupings: compGroupings,
    });
  }

  // 2. Layered (N-Tier) Architecture
  const serviceFiles = paths.filter(
    (p) => p.includes('/services/') || p.endsWith('.service.ts') || p.includes('/logic/')
  );
  const modelFiles = paths.filter(
    (p) =>
      p.includes('/models/') ||
      p.endsWith('.model.ts') ||
      p.includes('/entities/') ||
      p.includes('/schema/')
  );
  const controllerFiles = paths.filter(
    (p) => p.includes('/controllers/') || p.includes('/routes/') || p.includes('/api/')
  );

  const layerCount =
    (serviceFiles.length > 0 ? 1 : 0) +
    (modelFiles.length > 0 ? 1 : 0) +
    (componentFiles.length > 0 || controllerFiles.length > 0 ? 1 : 0);

  if (layerCount >= 2) {
    const matching = Array.from(new Set([...serviceFiles, ...modelFiles, ...controllerFiles]));
    const confidence = layerCount >= 3 ? 92 : 75;

    const layerGroupings: PatternGrouping[] = [];
    if (controllerFiles.length > 0) {
      layerGroupings.push({
        name: 'Controller / API Layer',
        description: 'Handles HTTP routes, request dispatch, and API endpoint definitions',
        files: controllerFiles,
        colorClass: 'amber',
      });
    }
    if (componentFiles.length > 0) {
      layerGroupings.push({
        name: 'Presentation Layer',
        description: 'UI templates, views, and visual rendering components',
        files: componentFiles,
        colorClass: 'sky',
      });
    }
    if (serviceFiles.length > 0) {
      layerGroupings.push({
        name: 'Service / Business Logic Layer',
        description: 'Core business logic, data processing, and service orchestration',
        files: serviceFiles,
        colorClass: 'indigo',
      });
    }
    if (modelFiles.length > 0) {
      layerGroupings.push({
        name: 'Data / Model Layer',
        description: 'Data models, entities, schemas, and persistence definitions',
        files: modelFiles,
        colorClass: 'emerald',
      });
    }

    patterns.push({
      id: 'layered-ntier',
      name: 'Layered (N-Tier) Architecture',
      category: 'System Structure',
      description:
        'Organizes code into horizontal tiers with isolated responsibilities (Presentation, Business Service Logic, Data Model/Persistence).',
      confidence,
      level: confidence > 85 ? 'High' : 'Medium',
      matchingFiles: matching.slice(0, 8),
      keyIndicators: [
        serviceFiles.length > 0 ? `Service Layer (${serviceFiles.length} files)` : '',
        modelFiles.length > 0 ? `Data/Model Layer (${modelFiles.length} files)` : '',
        componentFiles.length > 0 ? `Presentation Layer (${componentFiles.length} files)` : '',
        controllerFiles.length > 0 ? `Controller/API Layer (${controllerFiles.length} files)` : '',
      ].filter(Boolean),
      icon: 'layers',
      colorClass: 'indigo',
      logicalGroupings: layerGroupings,
    });
  }

  // 3. Clean Architecture / Hexagonal / Onion
  const domainFiles = paths.filter(
    (p) =>
      p.includes('/domain/') ||
      p.includes('/core/') ||
      p.includes('/entities/') ||
      p.includes('/aggregates/')
  );
  const useCaseFiles = paths.filter(
    (p) =>
      p.includes('/usecases/') ||
      p.includes('/use-cases/') ||
      p.includes('/application/') ||
      p.includes('/interactors/')
  );
  const infraFiles = paths.filter(
    (p) =>
      p.includes('/infrastructure/') ||
      p.includes('/adapters/') ||
      p.includes('/repositories/') ||
      p.includes('/gateways/')
  );
  const presentationFiles = paths.filter(
    (p) =>
      p.includes('/presentation/') ||
      p.includes('/ui/') ||
      p.includes('/controllers/')
  );

  const cleanLayerCount =
    (domainFiles.length > 0 ? 1 : 0) +
    (useCaseFiles.length > 0 ? 1 : 0) +
    (infraFiles.length > 0 ? 1 : 0) +
    (presentationFiles.length > 0 ? 1 : 0);

  if (cleanLayerCount >= 3 || (domainFiles.length > 0 && useCaseFiles.length > 0 && infraFiles.length > 0)) {
    const cleanGroupings: PatternGrouping[] = [];
    if (domainFiles.length > 0) {
      cleanGroupings.push({
        name: 'Domain Entities & Value Objects',
        description: 'Core enterprise business rules and enterprise data structures',
        files: domainFiles,
        colorClass: 'emerald',
      });
    }
    if (useCaseFiles.length > 0) {
      cleanGroupings.push({
        name: 'Application Use Cases & Interactors',
        description: 'Application-specific business workflows and orchestrations',
        files: useCaseFiles,
        colorClass: 'indigo',
      });
    }
    if (infraFiles.length > 0) {
      cleanGroupings.push({
        name: 'Infrastructure & Adapters',
        description: 'Data repositories, external APIs, persistence drivers, and peripheral adapters',
        files: infraFiles,
        colorClass: 'amber',
      });
    }
    if (presentationFiles.length > 0) {
      cleanGroupings.push({
        name: 'Presentation & Delivery',
        description: 'UI components, CLI controllers, and HTTP route handlers',
        files: presentationFiles,
        colorClass: 'sky',
      });
    }

    patterns.push({
      id: 'clean-architecture',
      name: 'Clean / Hexagonal Architecture',
      category: 'System Structure',
      description:
        'Enforces separation of concerns via inverted dependencies, isolating core domain rules from UI and infrastructure concerns.',
      confidence: cleanLayerCount >= 3 ? 95 : 82,
      level: 'High',
      matchingFiles: Array.from(
        new Set([...domainFiles, ...useCaseFiles, ...infraFiles, ...presentationFiles])
      ).slice(0, 8),
      keyIndicators: [
        `Domain Core (${domainFiles.length} files)`,
        `Application Use Cases (${useCaseFiles.length} files)`,
        `Infrastructure & Repositories (${infraFiles.length} files)`,
        `Inverted dependency boundaries`,
      ],
      icon: 'shield',
      colorClass: 'emerald',
      logicalGroupings: cleanGroupings,
    });
  }

  // 4. Model-View-ViewModel (MVVM) Pattern
  const viewModelFiles = paths.filter(
    (p) =>
      p.toLowerCase().includes('viewmodel') ||
      p.endsWith('.vm.ts') ||
      p.includes('/viewmodels/') ||
      p.includes('/view-models/')
  );
  if (viewModelFiles.length > 0 && (modelFiles.length > 0 || componentFiles.length > 0)) {
    const mvvmGroupings: PatternGrouping[] = [];
    if (modelFiles.length > 0) {
      mvvmGroupings.push({
        name: 'Model',
        description: 'Business entities, domain state, and data schemas',
        files: modelFiles,
        colorClass: 'emerald',
      });
    }
    if (componentFiles.length > 0) {
      mvvmGroupings.push({
        name: 'View',
        description: 'UI components, templates, and view layouts',
        files: componentFiles,
        colorClass: 'sky',
      });
    }
    if (viewModelFiles.length > 0) {
      mvvmGroupings.push({
        name: 'ViewModel',
        description: 'State binders, UI transformers, and command dispatchers',
        files: viewModelFiles,
        colorClass: 'purple',
      });
    }

    patterns.push({
      id: 'mvvm',
      name: 'Model-View-ViewModel (MVVM)',
      category: 'Architectural Pattern',
      description:
        'Decouples graphical UI development (View) from business logic (Model) via stateful observable binding layers (ViewModel).',
      confidence: 88,
      level: 'High',
      matchingFiles: Array.from(new Set([...modelFiles, ...componentFiles, ...viewModelFiles])).slice(
        0,
        8
      ),
      keyIndicators: [
        `ViewModels (${viewModelFiles.length} state binders)`,
        `Models (${modelFiles.length} entities/schemas)`,
        `Views (${componentFiles.length} UI templates)`,
      ],
      icon: 'layout',
      colorClass: 'purple',
      logicalGroupings: mvvmGroupings,
    });
  }

  // 5. Model-View-Controller (MVC) Pattern
  if (
    modelFiles.length > 0 &&
    (componentFiles.length > 0 || controllerFiles.length > 0) &&
    viewModelFiles.length === 0
  ) {
    const mvcMatching = Array.from(new Set([...modelFiles, ...componentFiles, ...controllerFiles]));
    const confidence =
      modelFiles.length > 0 && componentFiles.length > 0 && controllerFiles.length > 0 ? 90 : 72;

    const mvcGroupings: PatternGrouping[] = [];
    if (modelFiles.length > 0) {
      mvcGroupings.push({
        name: 'Model',
        description: 'Data models, entities, and schema definitions',
        files: modelFiles,
        colorClass: 'emerald',
      });
    }
    if (componentFiles.length > 0) {
      mvcGroupings.push({
        name: 'View',
        description: 'UI templates, components, and visual rendering',
        files: componentFiles,
        colorClass: 'sky',
      });
    }
    if (controllerFiles.length > 0) {
      mvcGroupings.push({
        name: 'Controller',
        description: 'Route handlers, API controllers, and request dispatchers',
        files: controllerFiles,
        colorClass: 'amber',
      });
    }

    patterns.push({
      id: 'mvc',
      name: 'Model-View-Controller (MVC)',
      category: 'Architectural Pattern',
      description:
        'Separates internal representations of information (Model) from user interaction (View) and business workflow dispatch (Controller/Service).',
      confidence,
      level: confidence > 85 ? 'High' : 'Medium',
      matchingFiles: mvcMatching.slice(0, 8),
      keyIndicators: [
        `Models (${modelFiles.length} file definitions)`,
        `Views (${componentFiles.length} template/UI components)`,
        controllerFiles.length > 0
          ? `Controllers (${controllerFiles.length} router/handlers)`
          : 'Service-driven Controller dispatches',
      ],
      icon: 'layout',
      colorClass: 'emerald',
      logicalGroupings: mvcGroupings,
    });
  }

  // 6. Event-Driven & Reactive Architecture
  const reactiveFiles = paths.filter((p) => {
    const content = fileNodes[p]?.content || '';
    return (
      content.includes('EventEmitter') ||
      content.includes('postMessage') ||
      content.includes('addEventListener') ||
      content.includes('Subject') ||
      content.includes('BehaviorSubject') ||
      content.includes('signal(') ||
      content.includes('Worker') ||
      p.includes('worker')
    );
  });

  if (reactiveFiles.length > 0) {
    const confidence = Math.min(95, 60 + reactiveFiles.length * 8);

    const signalFiles = reactiveFiles.filter((p) => {
      const c = fileNodes[p]?.content || '';
      return c.includes('signal(') || c.includes('Subject') || c.includes('BehaviorSubject');
    });
    const workerFiles = reactiveFiles.filter(
      (p) =>
        p.includes('worker') ||
        (fileNodes[p]?.content || '').includes('postMessage') ||
        (fileNodes[p]?.content || '').includes('Worker')
    );
    const eventFiles = reactiveFiles.filter((p) => {
      const c = fileNodes[p]?.content || '';
      return c.includes('EventEmitter') || c.includes('addEventListener');
    });

    const reactiveGroupings: PatternGrouping[] = [];
    if (signalFiles.length > 0) {
      reactiveGroupings.push({
        name: 'Signals & Observables',
        description: 'Reactive state management via signals, Subjects, and observables',
        files: signalFiles,
        colorClass: 'amber',
      });
    }
    if (workerFiles.length > 0) {
      reactiveGroupings.push({
        name: 'Web Workers & Message Passing',
        description: 'Background thread workers using postMessage for async communication',
        files: workerFiles,
        colorClass: 'purple',
      });
    }
    if (eventFiles.length > 0) {
      reactiveGroupings.push({
        name: 'Event Emitters & Listeners',
        description: 'DOM or custom event-based communication channels',
        files: eventFiles,
        colorClass: 'sky',
      });
    }

    patterns.push({
      id: 'event-driven',
      name: 'Event-Driven & Reactive Architecture',
      category: 'Data & Async Flow',
      description:
        'Uses asynchronous event channels, reactive state signals/observables, and message passing (e.g. Web Workers / Events) to decouple producers and consumers.',
      confidence,
      level: confidence > 80 ? 'High' : 'Medium',
      matchingFiles: reactiveFiles.slice(0, 8),
      keyIndicators: [
        'Reactive State Signals & Event Observers',
        'Asynchronous Web Worker message dispatching (`postMessage`)',
        `Found in ${reactiveFiles.length} key modules`,
      ],
      icon: 'bolt',
      colorClass: 'amber',
      logicalGroupings: reactiveGroupings,
    });
  }

  // 7. Async Pipeline & Web Worker Task Pattern
  const pipelineFiles = paths.filter((p) => {
    const content = fileNodes[p]?.content || '';
    return (
      p.includes('worker') ||
      content.includes('progress') ||
      content.includes('stage') ||
      content.includes('parse')
    );
  });
  if (pipelineFiles.length >= 2) {
    const workerPipeFiles = pipelineFiles.filter((p) => p.includes('worker'));
    const orchestrationFiles = pipelineFiles.filter((p) => !p.includes('worker'));

    const pipelineGroupings: PatternGrouping[] = [];
    if (workerPipeFiles.length > 0) {
      pipelineGroupings.push({
        name: 'Worker Threads',
        description: 'Background worker scripts handling off-thread computation',
        files: workerPipeFiles,
        colorClass: 'purple',
      });
    }
    if (orchestrationFiles.length > 0) {
      pipelineGroupings.push({
        name: 'Pipeline Orchestration',
        description: 'Files coordinating staged data processing, progress tracking, and parsing',
        files: orchestrationFiles,
        colorClass: 'indigo',
      });
    }

    patterns.push({
      id: 'pipeline-worker',
      name: 'Pipeline & Off-Thread Worker Pattern',
      category: 'Execution & Concurrency',
      description:
        'Offloads computationally heavy AST analysis and ZIP extraction to multi-threaded Web Workers using staged pipeline processing.',
      confidence: 88,
      level: 'High',
      matchingFiles: pipelineFiles.slice(0, 8),
      keyIndicators: [
        'Non-blocking background thread worker execution',
        'Staged data processing pipeline (Extract → AST Parse → Graph Resolution)',
        'Progress tracking & asynchronous status emission',
      ],
      icon: 'cpu',
      colorClass: 'purple',
      logicalGroupings: pipelineGroupings,
    });
  }

  // 8. Centralized Singleton Store Pattern
  const storeFiles = paths.filter((p) => {
    const content = fileNodes[p]?.content || '';
    return (
      content.includes("providedIn: 'root'") ||
      content.includes('VisualizerStoreService') ||
      content.includes('createStore') ||
      content.includes('Store')
    );
  });
  if (storeFiles.length > 0) {
    const storeDefFiles = storeFiles.filter((p) => p.includes('/services/') || p.includes('store'));
    const storeConsumers = storeFiles.filter(
      (p) => !p.includes('/services/') && !p.includes('store')
    );

    const storeGroupings: PatternGrouping[] = [];
    if (storeDefFiles.length > 0) {
      storeGroupings.push({
        name: 'Store Definitions',
        description: 'Singleton service definitions providing centralized reactive state',
        files: storeDefFiles,
        colorClass: 'rose',
      });
    }
    if (storeConsumers.length > 0) {
      storeGroupings.push({
        name: 'Store Consumers',
        description: 'Components and services that inject and consume shared store state',
        files: storeConsumers,
        colorClass: 'sky',
      });
    }

    patterns.push({
      id: 'singleton-store',
      name: 'Centralized Singleton State Store',
      category: 'State Management',
      description:
        'Provides a single source of truth for global application state, active tabs, layout preferences, and analysis results across components.',
      confidence: 94,
      level: 'High',
      matchingFiles: storeFiles.slice(0, 8),
      keyIndicators: [
        'Single source of truth global reactive store',
        'Dependency injected singleton services',
        'Atomic signal state updates',
      ],
      icon: 'database',
      colorClass: 'rose',
      logicalGroupings: storeGroupings,
    });
  }

  return patterns;
}
