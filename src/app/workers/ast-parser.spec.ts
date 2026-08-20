import { describe, it, expect } from 'vitest';
import {
  parseFileContents,
  parseWithRegex,
  countLineMetrics,
  calculateMaintainabilityIndex,
} from './ast-parser';

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

      const result = parseFileContents('src/App.tsx', code, 'tsx');

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

      const result = parseFileContents('src/index.ts', code, 'ts');

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

      const result = parseFileContents('src/user.service.ts', code, 'ts');

      expect(result.imports).toContain('@angular/core');
      expect(result.astSummary.classCount).toBe(1);
    });

    it('handles empty or whitespace-only code files safely', () => {
      const result = parseFileContents('src/empty.ts', '   \n  \n  ', 'ts');

      expect(result.imports).toEqual([]);
      expect(result.exports).toEqual([]);
      expect(result.astSummary.functionCount).toBe(0);
      expect(result.astSummary.classCount).toBe(0);
      expect(result.astSummary.cyclomaticComplexity).toBe(1);
      expect(result.astSummary.maintainabilityIndex).toBe(100);
    });

    it('computes cyclomatic complexity for decision branches (if, else, switch, case, loops, catch, logical ops)', () => {
      const complexCode = `
        export function processPayment(amount: number, status: string, options?: any) {
          if (amount <= 0) {
            throw new Error('Invalid amount');
          } else if (status === 'PENDING') {
            return false;
          } else {
            for (let i = 0; i < 5; i++) {
              if (options?.retry && status !== 'FAILED') {
                while (amount > 100) {
                  amount -= 10;
                }
              }
            }
          }

          const fallback = options ?? {};
          const isValid = status === 'OK' || status === 'SUCCESS' ? true : false;

          switch (status) {
            case 'OK':
              return true;
            case 'SUCCESS':
              return true;
            default:
              break;
          }

          try {
            return isValid;
          } catch (e) {
            return false;
          }
        }
      `;

      const result = parseFileContents('src/payment.ts', complexCode, 'ts');

      // Base 1 + if(1) + else-if(1) + else(1) + for(1) + if(1) + &&(1) + while(1) + ??(1) + ||(1) + ternary(1) + case(2) + catch(1)
      expect(result.astSummary.cyclomaticComplexity).toBeGreaterThan(8);
      expect(result.astSummary.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(result.astSummary.maintainabilityIndex).toBeLessThanOrEqual(100);
    });
  });

  describe('countLineMetrics', () => {
    it('accurately counts LOC, blank lines, and comment lines', () => {
      const source = `// Single line comment
/*
 * Multi-line comment block
 */
function hello() {
  // Inner comment
  const x = 10;

  return x * 2;
}
`;
      const metrics = countLineMetrics(source, 'ts');

      expect(metrics.totalLines).toBe(11);
      expect(metrics.blankLines).toBe(2);
      expect(metrics.commentLines).toBe(5); // lines 1, 2, 3, 4, 6
      expect(metrics.codeLines).toBe(4);    // lines 5, 7, 9, 10
      expect(metrics.commentRatio).toBeCloseTo(5 / 11, 2);
    });

    it('handles empty source strings', () => {
      const metrics = countLineMetrics('', 'ts');
      expect(metrics.totalLines).toBe(0);
      expect(metrics.codeLines).toBe(0);
      expect(metrics.blankLines).toBe(0);
      expect(metrics.commentLines).toBe(0);
      expect(metrics.commentRatio).toBe(0);
    });
  });

  describe('calculateMaintainabilityIndex', () => {
    it('returns high score (100) for simple or empty files', () => {
      const mi = calculateMaintainabilityIndex(0, 1, 0);
      expect(mi).toBe(100);
    });

    it('returns reasonable bounded score between 0 and 100 for high complexity files', () => {
      const mi = calculateMaintainabilityIndex(500, 45, 0.05);
      expect(mi).toBeGreaterThanOrEqual(0);
      expect(mi).toBeLessThan(70);
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

      const result = parseFileContents('src/malformed.js', malformedCode, 'js');

      expect(result.imports).toContain('./broken-syntax');
    });
  });
});
