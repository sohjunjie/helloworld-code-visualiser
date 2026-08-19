import JSZip from 'jszip';

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'bmp', 'tiff',
  'pdf', 'zip', 'tar', 'gz', '7z', 'rar', 'tgz',
  'exe', 'dll', 'so', 'dylib', 'bin',
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'flv', 'ogg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'lock', 'wasm',
]);

export function getFileExtension(path: string): string {
  const parts = path.split('/');
  const filename = parts[parts.length - 1] || path;
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0) return '';
  return filename.substring(dotIndex + 1).toLowerCase();
}

export function getBasename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export function getDirname(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
}

export function isBinaryFile(path: string): boolean {
  const ext = getFileExtension(path);
  return BINARY_EXTENSIONS.has(ext);
}

export function shouldIgnoreFile(relativePath: string, isDirectory = false): boolean {
  if (isDirectory) return true;

  const normalized = relativePath.replace(/\\/g, '/');

  // Ignored directory paths and patterns
  if (
    normalized.includes('node_modules/') ||
    normalized.startsWith('node_modules/') ||
    normalized.includes('.git/') ||
    normalized.startsWith('.git/') ||
    normalized.includes('dist/') ||
    normalized.startsWith('dist/') ||
    normalized.includes('build/') ||
    normalized.startsWith('build/') ||
    normalized.includes('coverage/') ||
    normalized.startsWith('coverage/') ||
    normalized.startsWith('__MACOSX/') ||
    normalized.endsWith('.DS_Store') ||
    normalized.endsWith('/')
  ) {
    return true;
  }

  if (isBinaryFile(normalized)) {
    return true;
  }

  return false;
}

export async function extractZipEntries(
  arrayBuffer: ArrayBuffer,
  onProgress?: (processed: number, total: number) => void
): Promise<Record<string, string>> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);

  const rawFiles: Record<string, string> = {};
  const entries = Object.keys(loadedZip.files);
  let processed = 0;

  for (const relativePath of entries) {
    const entry = loadedZip.files[relativePath];
    processed++;

    const isIgnored = shouldIgnoreFile(relativePath, entry.dir);
    if (!isIgnored) {
      try {
        const content = await entry.async('text');
        // Normalize path (remove leading slashes)
        const cleanPath = relativePath.replace(/^\/+/, '');
        rawFiles[cleanPath] = content;
      } catch {
        // Skip non-text files that fail string extraction
      }
    }

    if (onProgress && (processed % 20 === 0 || processed === entries.length)) {
      onProgress(processed, entries.length);
    }
  }

  return rawFiles;
}
