import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { createTranslator } from "../../i18n/translate.ts";
import { DEFAULT_SOFT_ROLL_RULES } from "../../utils/gear-pick-soft-roll.ts";
import { GearPickRules } from "./gear-pick-rules.tsx";

it.each([
  ["en", "Decrease the soft reserve limit", "Increase the soft reserve limit"],
  ["ru", "Уменьшить лимит софт-резервов", "Увеличить лимит софт-резервов"],
] as const)("exposes distinct keyboard controls in %s", async (locale, decrease, increase) => {
  const user = userEvent.setup();
  const onRulesChange = vi.fn();
  render(<GearPickRules rules={DEFAULT_SOFT_ROLL_RULES} onRulesChange={onRulesChange}
    softBudgetUsed={0} t={createTranslator(locale)} />);
  await user.tab();
  expect(screen.getByRole("button", { name: decrease })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(onRulesChange).toHaveBeenLastCalledWith({ ...DEFAULT_SOFT_ROLL_RULES, maxSofts: 2 });
  await user.tab();
  expect(screen.getByRole("button", { name: increase })).toHaveFocus();
  await user.keyboard(" ");
  expect(onRulesChange).toHaveBeenLastCalledWith({ ...DEFAULT_SOFT_ROLL_RULES, maxSofts: 4 });
});
