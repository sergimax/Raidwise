/** Swap a character one step left (−1) or right (+1). No-op at ends or if missing. */
export function moveCharacterInList<T extends { id: string }>(
  characters: T[],
  characterId: string,
  direction: -1 | 1,
): T[] {
  const index = characters.findIndex((character) => character.id === characterId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= characters.length) {
    return characters;
  }
  const next = [...characters];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function getCharacterOrderNeighbors<T extends { id: string }>(
  characters: T[],
  characterId: string,
): {
  index: number;
  left: T | null;
  right: T | null;
  canMoveLeft: boolean;
  canMoveRight: boolean;
} {
  const index = characters.findIndex((character) => character.id === characterId);
  if (index < 0) {
    return {
      index: -1,
      left: null,
      right: null,
      canMoveLeft: false,
      canMoveRight: false,
    };
  }
  return {
    index,
    left: index > 0 ? characters[index - 1]! : null,
    right: index < characters.length - 1 ? characters[index + 1]! : null,
    canMoveLeft: index > 0,
    canMoveRight: index < characters.length - 1,
  };
}
