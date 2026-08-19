import { describe, it, expect } from 'vitest';
import { parseFileContents, parseWithRegex } from './ast-parser';

describe('ast-parser', () => {
  describe('parseFileContents with TypeScript / JavaScript (Babel AST)', () => {
    it('parses ES import declarations, named exports, and default exports', () => {
      const code = `
        import React, { useState, useEffect } from 'react';
        import { Header } from './components/Header';
        import './styles.css';

        export const API_URL = 'https://api.example.com';
        export function fetchData() { return true; }
        export default class AppService {}
      `;

      const result = parseFileContents('src/App.tsx', code, 'tsx', 9);

      expect(result.imports).toContain('react');
      expect(result.imports).toContain('./components/Header');
      expect(result.imports).toContain('./styles.css');
      expect(result.exports).toContain('default');
      expect(result.astSummary.functionCount).toBe(1);
      expect(result.astSummary.classCount).toBe(1);
      expect(result.astSummary.importCount).toBe(3);
      expect(result.astSummary.totalLines).toBe(9);
    });

    it('parses re-exports from external or local modules', () => {
      const code = `
        export { Button } from './Button';
        export * from './types';
      `;

      const result = parseFileContents('src/index.ts', code, 'ts', 3);

      expect(result.imports).toContain('./Button');
      expect(result.imports).toContain('./types');
    });

    it('parses TypeScript decorators and class declarations cleanly', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserService {
          getUser() {}
        }
      `;

      const result = parseFileContents('src/user.service.ts', code, 'ts', 7);

      expect(result.imports).toContain('@angular/core');
      expect(result.astSummary.classCount).toBe(1);
    });

    it('handles empty or whitespace-only code files safely', () => {
      const result = parseFileContents('src/empty.ts', '   \n  \n  ', 'ts', 3);

      expect(result.imports).toEqual([]);
      expect(result.exports).toEqual([]);
      expect(result.astSummary.functionCount).toBe(0);
      expect(result.astSummary.classCount).toBe(0);
    });
  });

  describe('parseWithRegex fallback', () => {
    it('extracts imports from require calls and import statements in non-standard files', () => {
      const code = `
        const fs = require('fs');
        const path = require("path");
        import foo from "./foo";
      `;

      const result = parseWithRegex(code);

      expect(result.imports).toContain('fs');
      expect(result.imports).toContain('path');
      expect(result.imports).toContain('./foo');
    });

    it('recovers gracefully with regex when Babel encounters syntax errors', () => {
      const malformedCode = `
        import { Something } from './broken-syntax';
        const invalid = <<< ??? >>>;
      `;

      const result = parseFileContents('src/malformed.js', malformedCode, 'js', 3);

      expect(result.imports).toContain('./broken-syntax');
    });
  });
});
