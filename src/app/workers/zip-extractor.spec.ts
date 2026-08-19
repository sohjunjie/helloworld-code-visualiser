import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
  shouldIgnoreFile,
  isBinaryFile,
  getFileExtension,
  getBasename,
  getDirname,
  extractZipEntries,
} from './zip-extractor';

describe('zip-extractor helpers', () => {
  describe('getFileExtension', () => {
    it('extracts lowercase file extension correctly', () => {
      expect(getFileExtension('src/index.ts')).toBe('ts');
      expect(getFileExtension('src/App.JSX')).toBe('jsx');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('Makefile')).toBe('');
      expect(getFileExtension('.gitignore')).toBe('');
    });
  });

  describe('getBasename and getDirname', () => {
    it('computes basename and dirname accurately across nested paths', () => {
      expect(getBasename('src/app/services/store.ts')).toBe('store.ts');
      expect(getDirname('src/app/services/store.ts')).toBe('src/app/services');
      expect(getBasename('root.txt')).toBe('root.txt');
      expect(getDirname('root.txt')).toBe('');
    });
  });

  describe('isBinaryFile', () => {
    it('identifies image, media, archive, and executable binaries', () => {
      expect(isBinaryFile('assets/logo.png')).toBe(true);
      expect(isBinaryFile('assets/icon.ico')).toBe(true);
      expect(isBinaryFile('assets/photo.webp')).toBe(true);
      expect(isBinaryFile('vendor/lib.dll')).toBe(true);
      expect(isBinaryFile('bin/runner.exe')).toBe(true);
      expect(isBinaryFile('fonts/font.woff2')).toBe(true);
      expect(isBinaryFile('archive.zip')).toBe(true);
      expect(isBinaryFile('docs/manual.pdf')).toBe(true);
    });

    it('identifies text source files as non-binary', () => {
      expect(isBinaryFile('src/main.ts')).toBe(false);
      expect(isBinaryFile('index.html')).toBe(false);
      expect(isBinaryFile('styles.css')).toBe(false);
      expect(isBinaryFile('package.json')).toBe(false);
      expect(isBinaryFile('README.md')).toBe(false);
    });
  });

  describe('shouldIgnoreFile', () => {
    it('ignores node_modules, .git, dist, and build directories', () => {
      expect(shouldIgnoreFile('node_modules/lodash/index.js')).toBe(true);
      expect(shouldIgnoreFile('.git/config')).toBe(true);
      expect(shouldIgnoreFile('dist/bundle.js')).toBe(true);
      expect(shouldIgnoreFile('build/output.js')).toBe(true);
      expect(shouldIgnoreFile('coverage/lcov.info')).toBe(true);
    });

    it('ignores macOS metadata files and directory entries', () => {
      expect(shouldIgnoreFile('__MACOSX/._app.ts')).toBe(true);
      expect(shouldIgnoreFile('src/.DS_Store')).toBe(true);
      expect(shouldIgnoreFile('src/components/', true)).toBe(true);
    });

    it('ignores binary files', () => {
      expect(shouldIgnoreFile('assets/hero.png')).toBe(true);
      expect(shouldIgnoreFile('dist.zip')).toBe(true);
    });

    it('allows valid project source and configuration files', () => {
      expect(shouldIgnoreFile('src/app/app.component.ts')).toBe(false);
      expect(shouldIgnoreFile('src/index.html')).toBe(false);
      expect(shouldIgnoreFile('package.json')).toBe(false);
      expect(shouldIgnoreFile('tsconfig.json')).toBe(false);
    });
  });

  describe('extractZipEntries', () => {
    it('extracts text contents from ZIP buffer and filters ignored entries', async () => {
      const zip = new JSZip();
      zip.file('src/index.ts', 'console.log("hello");');
      zip.file('src/utils.ts', 'export const add = (a: number, b: number) => a + b;');
      zip.file('node_modules/dep/index.js', 'module.exports = {};');
      zip.file('dist/bundle.js', 'var a = 1;');
      zip.file('assets/logo.png', new Uint8Array([137, 80, 78, 71]));
      zip.file('.git/HEAD', 'ref: refs/heads/main');
      zip.file('__MACOSX/._index.ts', 'hidden');

      const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
      const progressLogs: { processed: number; total: number }[] = [];

      const result = await extractZipEntries(arrayBuffer, (processed, total) => {
        progressLogs.push({ processed, total });
      });

      expect(Object.keys(result)).toEqual(['src/index.ts', 'src/utils.ts']);
      expect(result['src/index.ts']).toBe('console.log("hello");');
      expect(result['src/utils.ts']).toBe('export const add = (a: number, b: number) => a + b;');
      expect(progressLogs.length).toBeGreaterThan(0);
    });

    it('strips leading slashes from file paths', async () => {
      const zip = new JSZip();
      zip.file('/src/main.ts', 'const x = 1;');

      const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
      const result = await extractZipEntries(arrayBuffer);

      expect(result['src/main.ts']).toBe('const x = 1;');
      expect(result['/src/main.ts']).toBeUndefined();
    });
  });
});
