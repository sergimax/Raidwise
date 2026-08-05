import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { BisListsProvider } from "../contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "../contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "../contexts/wow-data-provider.tsx";
import { createAppTheme } from "../theme/create-app-theme.ts";

export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={createAppTheme("light")}>
      <ItemTooltipLocaleProvider initialLocale="en">
        <WowDataProvider>
          <BisListsProvider>{children}</BisListsProvider>
        </WowDataProvider>
      </ItemTooltipLocaleProvider>
    </ThemeProvider>
  );
}
