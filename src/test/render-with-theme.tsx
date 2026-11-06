import {
  render as testingLibraryRender,
  type RenderOptions,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { TestProviders } from "./test-providers.tsx";
import type { AppLocale } from "../i18n/types.ts";

export function renderWithTheme(
  ui: ReactElement,
  { locale, ...options }: Omit<RenderOptions, "wrapper"> & { locale?: AppLocale } = {},
) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }) => <TestProviders locale={locale}>{children}</TestProviders>,
    ...options,
  });
}

export {
  screen,
  within,
  waitFor,
  fireEvent,
} from "@testing-library/react";
