import { Component, type ReactNode } from "react";
import { getInitialItemTooltipLocale } from "../../hooks/item-tooltip-locale.ts";
import { createTranslator } from "../../i18n/translate.ts";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const locale = getInitialItemTooltipLocale();
    const t = createTranslator(locale);
    return (
      <main className="app-recovery" lang={locale}>
        <h1>{t("appRecovery.title")}</h1>
        <p role="alert">{t("appRecovery.message")}</p>
        <button type="button" onClick={() => this.setState({ failed: false })}>
          {t("appRecovery.retry")}
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          {t("wowData.reload")}
        </button>
      </main>
    );
  }
}
