import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { BisListsProvider } from "../contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "../contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "../contexts/wow-data-provider.tsx";
import { createAppTheme } from "../theme/create-app-theme.ts";
import type { AppLocale } from "../i18n/types.ts";

export function TestProviders({ children, locale = "en" }: { children: ReactNode; locale?: AppLocale }) {
  return (
    <ThemeProvider theme={createAppTheme("light")}>
      <ItemTooltipLocaleProvider initialLocale={locale}>
        <WowDataProvider>
          <MemoryRouter><BisListsProvider>{children}</BisListsProvider></MemoryRouter>
        </WowDataProvider>
      </ItemTooltipLocaleProvider>
    </ThemeProvider>
  );
}
