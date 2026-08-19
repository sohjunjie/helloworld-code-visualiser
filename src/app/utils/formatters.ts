/**
 * Formats byte size into human-readable format (B, KB, MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Returns Tailwind badge CSS class string for pattern color categories.
 */
export function getBadgeClass(colorClass: string): string {
  switch (colorClass) {
    case 'sky':
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30';
    case 'indigo':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30';
    case 'amber':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
    case 'emerald':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'purple':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30';
    case 'rose':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30';
  }
}
