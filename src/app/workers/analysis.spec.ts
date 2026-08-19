import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { buildAndParseGraph, processZipFile, processDemoFiles } from './analysis.worker';
import { UploadProgress } from '../models/code-visualizer.models';

describe('analysis.worker integration pipeline', () => {
  it('processes demo files and builds complete AnalysisResult graph and stats', async () => {
    const files = {
      'src/main.ts': {
        content: `
          import { AppService } from './app.service';
          export const app = new AppService();
        `,
      },
      'src/app.service.ts': {
        content: `
          import { User } from './user.model';
          export class AppService {
            getUser(): User { return { id: '1' }; }
          }
        `,
      },
      'src/user.model.ts': {
        content: `
          export interface User { id: string; }
        `,
      },
    };

    const progressUpdates: UploadProgress[] = [];
    const result = await processDemoFiles(files, 'Demo App', (p) => {
      progressUpdates.push(p);
    });

    expect(result.projectName).toBe('Demo App');
    expect(result.stats.totalFiles).toBe(3);
    expect(Object.keys(result.files)).toHaveLength(3);
    expect(result.edges.length).toBe(2);
    expect(result.edges).toContainEqual(
      expect.objectContaining({ source: 'src/main.ts', target: 'src/app.service.ts' })
    );
    expect(result.edges).toContainEqual(
      expect.objectContaining({ source: 'src/app.service.ts', target: 'src/user.model.ts' })
    );
    expect(result.stats.circularDependencies).toEqual([]);
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1].stage).toBe('complete');
  });

  it('extracts and parses ZIP archive end-to-end with circular dependency detection', async () => {
    const zip = new JSZip();
    zip.file('src/a.ts', 'import "./b"; export const a = 1;');
    zip.file('src/b.ts', 'import "./a"; export const b = 2;');
    zip.file('node_modules/pkg/index.js', 'module.exports = {};');
    zip.file('dist/bundle.js', 'console.log("built");');

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const progressUpdates: UploadProgress[] = [];

    const result = await processZipFile(buffer, 'cycle-project.zip', (p) => {
      progressUpdates.push(p);
    });

    expect(result.projectName).toBe('cycle-project');
    expect(result.stats.totalFiles).toBe(2);
    expect(result.files['src/a.ts']).toBeDefined();
    expect(result.files['src/b.ts']).toBeDefined();
    expect(result.files['node_modules/pkg/index.js']).toBeUndefined();
    expect(result.files['dist/bundle.js']).toBeUndefined();
    expect(result.stats.circularDependencies.length).toBe(1);
    expect(result.stats.circularDependencies[0]).toEqual(['src/a.ts', 'src/b.ts', 'src/a.ts']);
  });

  it('builds directory tree correctly with aggregated sizes', async () => {
    const rawFiles: Record<string, string> = {
      'src/components/Header.tsx': 'export const Header = () => <header />;',
      'src/components/Footer.tsx': 'export const Footer = () => <footer />;',
      'src/index.ts': 'import "./components/Header"; import "./components/Footer";',
    };

    const result = await buildAndParseGraph(rawFiles, 'ReactApp');

    expect(result.rootNode.name).toBe('ReactApp');
    expect(result.rootNode.type).toBe('directory');
    const src = result.rootNode.children?.find((c) => c.name === 'src');
    expect(src).toBeDefined();
    const comp = src?.children?.find((c) => c.name === 'components');
    expect(comp).toBeDefined();
    expect(comp?.children?.length).toBe(2);
  });
});
