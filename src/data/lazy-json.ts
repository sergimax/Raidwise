/** A running build may still refer to an asset removed by a deployment. */
export class MissingWowDataAssetError extends Error {}

/** Cache successful loads and share in-flight requests. Failed requests can be retried. */
export function createLazyJsonLoader(
  url: string,
  hydrate: (data: unknown) => void,
): () => Promise<void> {
  let loadPromise: Promise<void> | null = null;
  let retry = false;

  return function ensureLoaded(): Promise<void> {
    if (!loadPromise) {
      loadPromise = Promise.resolve().then(async () => {
        const response = await fetch(url, { cache: retry ? "no-cache" : "default" });
        if (response.status === 404 || response.status === 410 ||
            (response.ok && response.headers.get("content-type")?.toLowerCase().includes("text/html"))) {
          throw new MissingWowDataAssetError(`Item data asset unavailable: ${url}`);
        }
        if (!response.ok) throw new Error(`Item data request failed: ${response.status}`);
        const data: unknown = await response.json();
        if (data === null || typeof data !== "object" || Array.isArray(data)) {
          throw new Error(`Invalid item data: ${url}`);
        }
        hydrate(data);
      }).catch((error: unknown) => {
        retry = true;
        loadPromise = null;
        throw error;
      });
    }
    return loadPromise;
  };
}
