
const pending = new Map<string, File>();
export const pendingFiles = {
  set: (key: string, file: File) => void pending.set(key, file),
  delete: (key: string) => void pending.delete(key),
  clear: () => pending.clear(),
  entries: () => Array.from(pending.entries()),
};