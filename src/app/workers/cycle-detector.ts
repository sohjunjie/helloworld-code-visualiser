/**
 * Depth-First Search (DFS) Cycle Detection Algorithm
 * Detects circular dependency paths among project source files.
 */
export function findCircularDependencies(
  filePaths: string[],
  adj: Record<string, string[]>,
  maxCycles = 10
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const pathStack: string[] = [];

  function dfs(curr: string) {
    if (cycles.length >= maxCycles) return;

    visited.add(curr);
    recStack.add(curr);
    pathStack.push(curr);

    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      if (cycles.length >= maxCycles) break;

      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        const cycleStartIndex = pathStack.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycle = pathStack.slice(cycleStartIndex);
          cycle.push(neighbor);
          if (cycles.length < maxCycles) {
            cycles.push(cycle);
          }
        }
      }
    }

    pathStack.pop();
    recStack.delete(curr);
  }

  for (const file of filePaths) {
    if (cycles.length >= maxCycles) break;
    if (!visited.has(file)) {
      dfs(file);
    }
  }

  return cycles;
}
