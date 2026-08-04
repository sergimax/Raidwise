import { createTheme } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { createAppTheme } from "../theme/create-app-theme.ts";
import { completionChipFill } from "./completion-chip-color.ts";

describe("completionChipFill", () => {
  const light = createAppTheme("light");
  const dark = createAppTheme("dark");

  it("uses muted gray when nothing is complete", () => {
    expect(completionChipFill(0, 10, light).backgroundColor).toBe("#737373");
    expect(completionChipFill(0, 10, dark).color).toBe(dark.palette.text.primary);
  });

  it("dims light progress toward darker palette stops", () => {
    expect(completionChipFill(1, 10, light).backgroundColor).toBe(
      light.palette.error.dark,
    );
    expect(completionChipFill(10, 10, light).backgroundColor).toBe(
      light.palette.success.dark,
    );
  });

  it("keeps full palette brightness in dark mode", () => {
    expect(completionChipFill(1, 10, dark).backgroundColor).toBe(
      dark.palette.error.main,
    );
    expect(completionChipFill(10, 10, dark).backgroundColor).toBe(
      dark.palette.success.main,
    );
  });

  it("moves through brand/info mid stops", () => {
    expect(completionChipFill(6, 10, light).backgroundColor).toBe(
      light.palette.secondary.dark,
    );
    expect(completionChipFill(8, 10, light).backgroundColor).toBe(
      light.palette.info.dark,
    );
  });

  it("works with a plain MUI theme fallback", () => {
    const plain = createTheme({ palette: { mode: "light" } });
    expect(completionChipFill(0, 5, plain).backgroundColor).toBeTruthy();
    expect(completionChipFill(5, 5, plain).backgroundColor).toBe(
      plain.palette.success.dark,
    );
  });
});
