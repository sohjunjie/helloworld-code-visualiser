import { describe, it, expect } from 'vitest';
import { findCircularDependencies } from './cycle-detector';

describe('cycle-detector: findCircularDependencies', () => {
  it('returns an empty array for an acyclic dependency graph', () => {
    const filePaths = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
    const adj: Record<string, string[]> = {
      'src/a.ts': ['src/b.ts', 'src/c.ts'],
      'src/b.ts': ['src/c.ts'],
      'src/c.ts': [],
    };

    const cycles = findCircularDependencies(filePaths, adj);
    expect(cycles).toEqual([]);
  });

  it('detects a simple two-node cycle (A -> B -> A)', () => {
    const filePaths = ['src/a.ts', 'src/b.ts'];
    const adj: Record<string, string[]> = {
      'src/a.ts': ['src/b.ts'],
      'src/b.ts': ['src/a.ts'],
    };

    const cycles = findCircularDependencies(filePaths, adj);
    expect(cycles.length).toBe(1);
    expect(cycles[0]).toEqual(['src/a.ts', 'src/b.ts', 'src/a.ts']);
  });

  it('detects a multi-node cycle (A -> B -> C -> A)', () => {
    const filePaths = ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts'];
    const adj: Record<string, string[]> = {
      'src/a.ts': ['src/b.ts'],
      'src/b.ts': ['src/c.ts'],
      'src/c.ts': ['src/a.ts', 'src/d.ts'],
      'src/d.ts': [],
    };

    const cycles = findCircularDependencies(filePaths, adj);
    expect(cycles.length).toBe(1);
    expect(cycles[0]).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/a.ts']);
  });

  it('detects self-referencing loops (A -> A)', () => {
    const filePaths = ['src/a.ts', 'src/b.ts'];
    const adj: Record<string, string[]> = {
      'src/a.ts': ['src/a.ts', 'src/b.ts'],
      'src/b.ts': [],
    };

    const cycles = findCircularDependencies(filePaths, adj);
    expect(cycles.length).toBe(1);
    expect(cycles[0]).toEqual(['src/a.ts', 'src/a.ts']);
  });

  it('handles disconnected subgraphs with multiple distinct cycles', () => {
    const filePaths = ['src/a.ts', 'src/b.ts', 'src/x.ts', 'src/y.ts', 'src/z.ts'];
    const adj: Record<string, string[]> = {
      'src/a.ts': ['src/b.ts'],
      'src/b.ts': ['src/a.ts'],
      'src/x.ts': ['src/y.ts'],
      'src/y.ts': ['src/z.ts'],
      'src/z.ts': ['src/x.ts'],
    };

    const cycles = findCircularDependencies(filePaths, adj);
    expect(cycles.length).toBe(2);
    expect(cycles).toContainEqual(['src/a.ts', 'src/b.ts', 'src/a.ts']);
    expect(cycles).toContainEqual(['src/x.ts', 'src/y.ts', 'src/z.ts', 'src/x.ts']);
  });

  it('respects maximum cycle limit cap to prevent memory bloat on large combinatorial graphs', () => {
    const filePaths = ['a', 'b', 'c', 'd'];
    const adj: Record<string, string[]> = {
      a: ['b', 'c', 'd'],
      b: ['a', 'c', 'd'],
      c: ['a', 'b', 'd'],
      d: ['a', 'b', 'c'],
    };

    const cycles = findCircularDependencies(filePaths, adj, 5);
    expect(cycles.length).toBeLessThanOrEqual(5);
  });
});
