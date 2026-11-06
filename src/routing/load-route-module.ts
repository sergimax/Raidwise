export class RouteModuleLoadError extends Error {}

export async function loadRouteModule<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (cause) {
    throw new RouteModuleLoadError("Could not load a route module", { cause });
  }
}
