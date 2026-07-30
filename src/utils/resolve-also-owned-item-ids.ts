/**
 * Resolve character-level also-owned item ids for an update.
 * - `update` provided (including `[]`) replaces previous; empty clears.
 * - `update` omitted keeps previous when non-empty.
 */
export function resolveAlsoOwnedItemIds(
  update: number[] | undefined,
  previous: number[] | undefined,
): number[] | undefined {
  const resolved = update !== undefined ? update : previous;
  if (resolved === undefined || resolved.length === 0) {
    return undefined;
  }
  return resolved;
}
