import * as babelParser from '@babel/parser';
import { AstSummary, ComplexityMetrics } from '../models/code-visualizer.models';

export interface ParsedAstResult {
  imports: string[];
  exports: string[];
  astSummary: AstSummary;
}

const JS_TS_EXTENSIONS = new Set(['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs']);

export function countLineMetrics(
  content: string,
  _ext?: string
): ComplexityMetrics & { loc: number } {
  if (!content || content.trim().length === 0) {
    const lines = content ? content.split('\n') : [];
    const totalLines = lines.length;
    return {
      totalLines,
      codeLines: 0,
      blankLines: totalLines,
      commentLines: 0,
      commentRatio: 0,
      cyclomaticComplexity: 1,
      maintainabilityIndex: 100,
      loc: 0,
    };
  }

  const lines = content.split('\n');
  const totalLines = lines.length;
  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;
  let inBlockComment = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      blankLines++;
      continue;
    }

    if (inBlockComment) {
      commentLines++;
      if (line.includes('*/') || line.includes('-->') || line.includes('"""') || line.includes("'''")) {
        inBlockComment = false;
      }
      continue;
    }

    // Check for block comment start
    if (line.startsWith('/*')) {
      commentLines++;
      if (!line.includes('*/')) {
        inBlockComment = true;
      }
    } else if (line.startsWith('<!--')) {
      commentLines++;
      if (!line.includes('-->')) {
        inBlockComment = true;
      }
    } else if (line.startsWith('"""') || line.startsWith("'''")) {
      commentLines++;
      if ((line.match(/"""/g)?.length || line.match(/'''/g)?.length || 0) < 2) {
        inBlockComment = true;
      }
    } else if (
      line.startsWith('//') ||
      line.startsWith('#') ||
      line.startsWith('--') ||
      line.startsWith(';')
    ) {
      commentLines++;
    } else {
      codeLines++;
    }
  }

  const commentRatio = totalLines > 0 ? +(commentLines / totalLines).toFixed(4) : 0;

  return {
    totalLines,
    codeLines,
    blankLines,
    commentLines,
    commentRatio,
    cyclomaticComplexity: 1,
    maintainabilityIndex: 100,
    loc: codeLines,
  };
}

export function calculateMaintainabilityIndex(
  loc: number,
  cyclomaticComplexity: number,
  commentRatio: number
): number {
  if (loc <= 0) return 100;
  const safeLoc = Math.max(1, loc);
  const safeComplexity = Math.max(1, cyclomaticComplexity);

  // Standard Coleman & Oman / SEI Maintainability Index formula normalized to 0-100
  const rawMI =
    171 -
    5.2 * Math.log(safeLoc) -
    0.23 * safeComplexity -
    16.2 * Math.log(safeLoc) +
    50 * Math.sin(Math.sqrt(2.4 * Math.max(0, Math.min(1, commentRatio))));

  const normalized = Math.round((rawMI * 100) / 171);
  return Math.max(0, Math.min(100, normalized));
}

function traverseAstForComplexity(node: any): number {
  if (!node || typeof node !== 'object') return 0;

  let count = 0;

  switch (node.type) {
    case 'IfStatement':
      count += 1;
      if (node.alternate && node.alternate.type !== 'IfStatement') {
        // 'else' branch that is not 'else if'
        count += 1;
      }
      break;
    case 'ConditionalExpression': // ternary ? :
      count += 1;
      break;
    case 'SwitchCase':
      if (node.test !== null) {
        // Non-default case statement
        count += 1;
      }
      break;
    case 'ForStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'WhileStatement':
    case 'DoWhileStatement':
      count += 1;
      break;
    case 'CatchClause':
      count += 1;
      break;
    case 'LogicalExpression':
      if (
        node.operator === '&&' ||
        node.operator === '||' ||
        node.operator === '??'
      ) {
        count += 1;
      }
      break;
  }

  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'comments' || key === 'tokens') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object') {
          count += traverseAstForComplexity(item);
        }
      }
    } else if (child && typeof child === 'object') {
      count += traverseAstForComplexity(child);
    }
  }

  return count;
}

export function estimateComplexityFromText(content: string): number {
  if (!content || content.trim().length === 0) return 1;

  let branches = 0;
  const branchRegex = /\b(if|else|switch|case|for|while|catch)\b|&&|\|\||\?\?|\?/g;
  const matches = content.match(branchRegex);
  if (matches) {
    branches = matches.length;
  }

  return 1 + branches;
}

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
  let cyclomaticComplexity = 1;

  const lineMetrics = countLineMetrics(content, ext);
  const totalLines = lineCount || lineMetrics.totalLines;

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

      // Compute cyclomatic complexity from AST traversal
      const decisionBranches = traverseAstForComplexity(ast.program);
      cyclomaticComplexity = 1 + decisionBranches;

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
      cyclomaticComplexity = estimateComplexityFromText(content);
    }
  } else if (content.trim().length > 0) {
    const regexRes = parseWithRegex(content);
    imports.push(...regexRes.imports);
    exports.push(...regexRes.exports);
    cyclomaticComplexity = estimateComplexityFromText(content);
  }

  const dedupedImports = Array.from(new Set(imports));
  const dedupedExports = Array.from(new Set(exports));
  const maintainabilityIndex = calculateMaintainabilityIndex(
    lineMetrics.codeLines,
    cyclomaticComplexity,
    lineMetrics.commentRatio
  );

  return {
    imports: dedupedImports,
    exports: dedupedExports,
    astSummary: {
      totalLines,
      codeLines: lineMetrics.codeLines,
      blankLines: lineMetrics.blankLines,
      commentLines: lineMetrics.commentLines,
      commentRatio: lineMetrics.commentRatio,
      cyclomaticComplexity,
      maintainabilityIndex,
      importCount: dedupedImports.length,
      exportCount: dedupedExports.length,
      functionCount,
      classCount,
    },
  };
}
