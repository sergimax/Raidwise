import type { SubmitEvent } from "react";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import type { CharacterClass } from "../../types/characters.ts";

export type CharacterFormProps = {
  name: string;
  characterClass: CharacterClass | "";
  mainSpec: string;
  mainGearScoreText: string;
  offSpec: string;
  offGearScoreText: string;
  mainGearItems: CharacterGearItem[] | undefined;
  offGearItems: CharacterGearItem[] | undefined;
  error: string;
  onNameChange: (name: string) => void;
  onClassChange: (characterClass: CharacterClass | "") => void;
  onMainSpecChange: (value: string) => void;
  onMainGearScoreTextChange: (value: string) => void;
  onOffSpecChange: (value: string) => void;
  onOffGearScoreTextChange: (value: string) => void;
  onMainGearItemsChange: (gearItems: CharacterGearItem[] | undefined) => void;
  onOffGearItemsChange: (gearItems: CharacterGearItem[] | undefined) => void;
  onImportError: (message: string) => void;
  onClearImportError: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};
