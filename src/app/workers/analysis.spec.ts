import { describe, it, expect } from 'vitest';
import * as babelParser from '@babel/parser';

describe('AST Parsing & Dependency Extraction Helper', () => {
  it('should parse JavaScript import statements', () => {
    const code = `import { useState } from 'react';\nimport { Header } from './components/Header';`;
    const ast = babelParser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    
    const imports: string[] = [];
    for (const stmt of ast.program.body) {
      if (stmt.type === 'ImportDeclaration') {
        imports.push(stmt.source.value);
      }
    }

    expect(imports).toContain('react');
    expect(imports).toContain('./components/Header');
  });

  it('should parse TypeScript interfaces and class exports', () => {
    const code = `export interface User { id: string; }\nexport class UserService { getUser() {} }`;
    const ast = babelParser.parse(code, { sourceType: 'module', plugins: ['typescript'] });
    
    expect(ast.program.body.length).toBeGreaterThanOrEqual(2);
  });
});
