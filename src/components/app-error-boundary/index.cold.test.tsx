import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ITEM_TOOLTIP_LOCALE_STORAGE_KEY } from "../../constants/item-tooltips.ts";
import { AppErrorBoundary } from "./index.tsx";

it("opens a localized recovery screen and remounts the app when retried", () => {
  localStorage.setItem(ITEM_TOOLTIP_LOCALE_STORAGE_KEY, "en");
  let broken = true;
  function Page() {
    if (broken) throw new Error("Rendering failed");
    return <p>Tracker available</p>;
  }

  render(<AppErrorBoundary><Page /></AppErrorBoundary>, { onCaughtError: vi.fn() });
  expect(screen.getByRole("heading", { name: "Raidwise could not open" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reload app" })).toBeInTheDocument();
  broken = false;
  fireEvent.click(screen.getByRole("button", { name: "Open Raidwise again" }));
  expect(screen.getByText("Tracker available")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
