import { createTheme } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { createAppTheme } from "../theme/create-app-theme.ts";
import { completionChipFill } from "./completion-chip-color.ts";

describe("completionChipFill", () => {
  const light = createAppTheme("light");
  const dark = createAppTheme("dark");

  it("uses muted theme border/gray when nothing is complete", () => {
    expect(completionChipFill(0, 10, light).backgroundColor).toBe(
      light.palette.divider,
    );
    expect(completionChipFill(0, 10, dark).color).toBe(dark.palette.text.primary);
  });

  it("uses danger for low progress and ok for complete", () => {
    expect(completionChipFill(1, 10, light).backgroundColor).toBe(
      light.palette.error.main,
    );
    expect(completionChipFill(10, 10, light).backgroundColor).toBe(
      light.palette.success.main,
    );
    expect(completionChipFill(10, 10, dark).backgroundColor).toBe(
      dark.palette.success.main,
    );
  });

  it("moves through brand/info mid stops", () => {
    const mid = completionChipFill(6, 10, light);
    expect(mid.backgroundColor).toBe(light.palette.secondary.main);
    const high = completionChipFill(8, 10, light);
    expect(high.backgroundColor).toBe(light.palette.info.main);
  });

  it("works with a plain MUI theme fallback", () => {
    const plain = createTheme({ palette: { mode: "light" } });
    expect(completionChipFill(0, 5, plain).backgroundColor).toBeTruthy();
    expect(completionChipFill(5, 5, plain).backgroundColor).toBe(
      plain.palette.success.main,
    );
  });
});
