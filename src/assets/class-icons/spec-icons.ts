import type { ClassName as ClassNameType } from "../../types/characters.ts";

const specIconModules = import.meta.glob<string>("./specs/*.webp", {
  eager: true,
  import: "default",
});

const classSlugs: Record<ClassNameType, string> = {
  "Death Knight": "death-knight",
  Druid: "druid",
  Hunter: "hunter",
  Mage: "mage",
  Paladin: "paladin",
  Priest: "priest",
  Rogue: "rogue",
  Shaman: "shaman",
  Warlock: "warlock",
  Warrior: "warrior",
};

function specToSlug(spec: string): string {
  return spec.toLowerCase().replace(/\s+/g, "-");
}

export function specIconFor(
  className: ClassNameType,
  spec: string,
): string | undefined {
  const modulePath = `./specs/${classSlugs[className]}-${specToSlug(spec)}.webp`;
  return specIconModules[modulePath];
}
