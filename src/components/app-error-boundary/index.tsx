import { Component, type ReactNode } from "react";
import { getInitialItemTooltipLocale } from "../../hooks/item-tooltip-locale.ts";
import { createTranslator } from "../../i18n/translate.ts";
import { RouteModuleLoadError } from "../../routing/load-route-module.ts";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failure: "render" | "module" | null }> {
  state: { failure: "render" | "module" | null } = { failure: null };

  static getDerivedStateFromError(error: unknown) {
    return { failure: error instanceof RouteModuleLoadError ? "module" : "render" };
  }

  render() {
    if (!this.state.failure) return this.props.children;
    const moduleFailed = this.state.failure === "module";
    const locale = getInitialItemTooltipLocale();
    const t = createTranslator(locale);
    return (
      <main className="app-recovery" lang={locale}>
        <h1>{t("appRecovery.title")}</h1>
        <p role="alert">{t(moduleFailed ? "appRecovery.moduleMessage" : "appRecovery.message")}</p>
        {!moduleFailed && <button type="button" onClick={() => this.setState({ failure: null })}>
          {t("appRecovery.retry")}
        </button>}
        <button type="button" onClick={() => window.location.reload()}>
          {t("wowData.reload")}
        </button>
      </main>
    );
  }
}
