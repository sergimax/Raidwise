/** Shared helper: load a JSON module once via dynamic import (Vite code-split chunk). */
export function createLazyJsonLoader<T>(
  importJson: () => Promise<{ default: T }>,
  hydrate: (data: T) => void,
): () => Promise<void> {
  let loadPromise: Promise<void> | null = null;

  return function ensureLoaded(): Promise<void> {
    if (!loadPromise) {
      loadPromise = Promise.resolve().then(importJson).then((module) => {
        hydrate(module.default);
      }).catch((error: unknown) => {
        loadPromise = null;
        throw error;
      });
    }
    return loadPromise;
  };
}
