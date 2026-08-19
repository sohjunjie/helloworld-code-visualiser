import { describe, it, expect } from 'vitest';
import { detectSoftwarePatterns } from './pattern-detector';
import { CodeFileNode } from '../models/code-visualizer.models';

function createMockFiles(fileList: { path: string; content?: string }[]): Record<string, CodeFileNode> {
  const result: Record<string, CodeFileNode> = {};
  for (const f of fileList) {
    result[f.path] = {
      id: f.path,
      path: f.path,
      name: f.path.split('/').pop() || f.path,
      type: 'file',
      size: 100,
      extension: f.path.split('.').pop() || '',
      content: f.content || '',
      imports: [],
      exports: [],
    };
  }
  return result;
}

describe('pattern-detector: detectSoftwarePatterns', () => {
  it('detects Component-Based Architecture when UI components are present', () => {
    const files = createMockFiles([
      { path: 'src/components/Header.tsx', content: 'export const Header = () => <header />;' },
      { path: 'src/components/Sidebar.tsx', content: 'export const Sidebar = () => <aside />;' },
      { path: 'src/views/Dashboard.vue', content: '<template><div>Dashboard</div></template>' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const componentPattern = patterns.find((p) => p.id === 'component-based');

    expect(componentPattern).toBeDefined();
    expect(componentPattern?.name).toBe('Component-Based Architecture');
    expect(componentPattern?.logicalGroupings.length).toBeGreaterThan(0);
  });

  it('detects Model-View-Controller (MVC) pattern when models, views, and controllers are present', () => {
    const files = createMockFiles([
      { path: 'src/models/user.model.ts', content: 'export interface User { id: string; }' },
      { path: 'src/components/user-card.component.ts', content: 'export class UserCardComponent {}' },
      { path: 'src/controllers/user.controller.ts', content: 'export class UserController {}' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const mvc = patterns.find((p) => p.id === 'mvc');

    expect(mvc).toBeDefined();
    expect(mvc?.name).toBe('Model-View-Controller (MVC)');
    expect(mvc?.logicalGroupings.map((g) => g.name)).toEqual(
      expect.arrayContaining(['Model', 'View', 'Controller'])
    );
  });

  it('detects Model-View-ViewModel (MVVM) pattern when view models, models, and views are present', () => {
    const files = createMockFiles([
      { path: 'src/models/product.model.ts', content: 'export interface Product {}' },
      { path: 'src/viewmodels/product.viewmodel.ts', content: 'export class ProductViewModel {}' },
      { path: 'src/views/product.view.html', content: '<div>{{ vm.productName }}</div>' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const mvvm = patterns.find((p) => p.id === 'mvvm');

    expect(mvvm).toBeDefined();
    expect(mvvm?.name).toBe('Model-View-ViewModel (MVVM)');
    expect(mvvm?.logicalGroupings.map((g) => g.name)).toEqual(
      expect.arrayContaining(['Model', 'View', 'ViewModel'])
    );
  });

  it('detects Clean / Hexagonal Architecture when domain, application, and infrastructure layers exist', () => {
    const files = createMockFiles([
      { path: 'src/domain/entities/order.entity.ts', content: 'export class Order {}' },
      { path: 'src/usecases/create-order.usecase.ts', content: 'export class CreateOrderUseCase {}' },
      { path: 'src/infrastructure/repositories/sql-order.repository.ts', content: 'export class SqlOrderRepository {}' },
      { path: 'src/presentation/controllers/order.controller.ts', content: 'export class OrderController {}' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const cleanArch = patterns.find((p) => p.id === 'clean-architecture');

    expect(cleanArch).toBeDefined();
    expect(cleanArch?.name).toContain('Clean');
    expect(cleanArch?.logicalGroupings.length).toBeGreaterThanOrEqual(3);
  });

  it('detects Layered (N-Tier) Architecture across service, model, and presentation layers', () => {
    const files = createMockFiles([
      { path: 'src/services/auth.service.ts', content: 'export class AuthService {}' },
      { path: 'src/models/auth.model.ts', content: 'export interface AuthModel {}' },
      { path: 'src/components/login.component.ts', content: 'export class LoginComponent {}' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const layered = patterns.find((p) => p.id === 'layered-ntier');

    expect(layered).toBeDefined();
    expect(layered?.name).toBe('Layered (N-Tier) Architecture');
  });

  it('detects Event-Driven and Reactive Architecture from signals, listeners, and worker messaging', () => {
    const files = createMockFiles([
      { path: 'src/services/bus.ts', content: 'const eventBus = new EventEmitter();' },
      { path: 'src/state/counter.ts', content: 'const count = signal(0);' },
      { path: 'src/workers/calc.worker.ts', content: 'addEventListener("message", (e) => postMessage(e.data));' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const reactive = patterns.find((p) => p.id === 'event-driven');

    expect(reactive).toBeDefined();
    expect(reactive?.name).toBe('Event-Driven & Reactive Architecture');
  });

  it('detects Singleton Store and Pipeline patterns', () => {
    const files = createMockFiles([
      { path: 'src/services/store.service.ts', content: "@Injectable({ providedIn: 'root' })\nexport class VisualizerStoreService {}" },
      { path: 'src/workers/analysis.worker.ts', content: 'function runPipeline() { const stage = "parse"; }' },
      { path: 'src/app/runner.ts', content: 'const stage = "unzipping"; const progress = 50;' },
    ]);

    const patterns = detectSoftwarePatterns(files, Object.keys(files).length);
    const store = patterns.find((p) => p.id === 'singleton-store');
    const pipeline = patterns.find((p) => p.id === 'pipeline-worker');

    expect(store).toBeDefined();
    expect(pipeline).toBeDefined();
  });
});
