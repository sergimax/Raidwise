import { useCallback, useState } from "react";
import { specsForClass } from "../data/class-specs.ts";
import { ClassName, type ClassName as ClassNameType } from "../types/characters.ts";

/**
 * Session-only BiS builds UI state. Owned above the overlay so switching
 * toolbar panels does not reset class / spec. Preset selection stays in
 * BiS localStorage via the domain.
 */
export function useBisListsSessionState() {
  const [className, setClassNameState] = useState<ClassNameType>(
    ClassName.DeathKnight,
  );
  const [spec, setSpec] = useState("Unholy");

  const setClassName = useCallback((nextClass: ClassNameType) => {
    setClassNameState(nextClass);
    setSpec(specsForClass(nextClass)[0] ?? "");
  }, []);

  return {
    className,
    spec,
    setClassName,
    setSpec,
  };
}

export type BisListsSessionState = ReturnType<typeof useBisListsSessionState>;
