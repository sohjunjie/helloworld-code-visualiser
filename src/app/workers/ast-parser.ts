import * as babelParser from '@babel/parser';

export interface ParsedAstResult {
  imports: string[];
  exports: string[];
  astSummary: {
    totalLines: number;
    importCount: number;
    exportCount: number;
    functionCount: number;
    classCount: number;
  };
}

const JS_TS_EXTENSIONS = new Set(['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs']);

export function parseWithRegex(content: string): { imports: string[]; exports: string[] } {
  const imports: string[] = [];
  const exports: string[] = [];

  const importPatterns = [
    /(?:import|export)\s+(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\s+['"]([^'"]+)['"]/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }
  }

  const exportPattern = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([a-zA-Z0-9_$]+)/g;
  let expMatch;
  while ((expMatch = exportPattern.exec(content)) !== null) {
    if (expMatch[0].includes('default')) {
      exports.push('default');
    } else if (expMatch[1]) {
      exports.push(expMatch[1]);
    }
  }

  return {
    imports: Array.from(new Set(imports)),
    exports: Array.from(new Set(exports)),
  };
}

export function parseFileContents(
  path: string,
  content: string,
  ext: string,
  lineCount = 0
): ParsedAstResult {
  const imports: string[] = [];
  const exports: string[] = [];
  let functionCount = 0;
  let classCount = 0;

  const isJsTs = JS_TS_EXTENSIONS.has(ext.toLowerCase());

  if (isJsTs && content.trim().length > 0) {
    try {
      const ast = babelParser.parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'exportDefaultFrom',
        ],
        errorRecovery: true,
      });

      for (const statement of ast.program.body) {
        if (statement.type === 'ImportDeclaration') {
          if (statement.source?.value) {
            imports.push(statement.source.value);
          }
        } else if (statement.type === 'ExportNamedDeclaration') {
          if (statement.source?.value) {
            imports.push(statement.source.value);
          }
          if (statement.declaration) {
            if (statement.declaration.type === 'FunctionDeclaration') functionCount++;
            if (statement.declaration.type === 'ClassDeclaration') classCount++;
          }
        } else if (statement.type === 'ExportDefaultDeclaration') {
          exports.push('default');
          if (statement.declaration) {
            if (statement.declaration.type === 'FunctionDeclaration') functionCount++;
            if (statement.declaration.type === 'ClassDeclaration') classCount++;
          }
        } else if (statement.type === 'ExportAllDeclaration') {
          if (statement.source?.value) {
            imports.push(statement.source.value);
          }
        } else if (statement.type === 'FunctionDeclaration') {
          functionCount++;
        } else if (statement.type === 'ClassDeclaration') {
          classCount++;
        }
      }

      // If Babel encountered recovery errors, also run regex to catch any missed imports
      if (ast.errors && ast.errors.length > 0) {
        const regexRes = parseWithRegex(content);
        imports.push(...regexRes.imports);
      }
    } catch {
      // Fallback regex parsing if Babel encounters fatal unparseable syntax
      const regexRes = parseWithRegex(content);
      imports.push(...regexRes.imports);
      exports.push(...regexRes.exports);
    }
  } else if (content.trim().length > 0) {
    const regexRes = parseWithRegex(content);
    imports.push(...regexRes.imports);
    exports.push(...regexRes.exports);
  }

  const dedupedImports = Array.from(new Set(imports));
  const dedupedExports = Array.from(new Set(exports));

  return {
    imports: dedupedImports,
    exports: dedupedExports,
    astSummary: {
      totalLines: lineCount || content.split('\n').length,
      importCount: dedupedImports.length,
      exportCount: dedupedExports.length,
      functionCount,
      classCount,
    },
  };
}
