export type ChangeRelease = {
  version: string;
  changes: { category: string; text: string }[];
};

export function getLatestRelease(markdown: string): ChangeRelease | null {
  let currentRelease: ChangeRelease | null = null;
  let category = "";

  for (const line of markdown.split(/\r?\n/)) {
    const release = line.match(/^## \[([^\]]+)\]/);
    if (release) {
      if (currentRelease) return currentRelease;
      if (release[1] !== "Unreleased") {
        currentRelease = { version: release[1], changes: [] };
      }
      category = "";
      continue;
    }

    const section = line.match(/^###\s+(.+)$/);
    if (section) {
      category = section[1];
      continue;
    }

    const change = line.match(/^\s*[-*+]\s+(.+)$/);
    if (change && currentRelease && category) {
      currentRelease.changes.push({ category, text: change[1] });
    }
  }

  return currentRelease;
}
