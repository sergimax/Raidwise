import { Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { APP_ROUTES, navigateTo, useAppRoute } from "../../routing/app-route.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppNavigation } from "../app-navigation/index.tsx";
import { ChangelogPage } from "../changelog-page/index.tsx";
import { TrackerLayout } from "../tracker-layout/index.tsx";

export function AppRouteContent() {
  const route = useAppRoute();
  const { t } = useTranslation();

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    if (
      route === APP_ROUTES.raids &&
      (window.location.pathname === "/" ||
        window.location.pathname === basePath ||
        window.location.pathname === `${basePath}/`)
    ) {
      navigateTo(APP_ROUTES.raids, true);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [route]);

  if (route === "/changelog") return <ChangelogPage />;
  if (route === "/reputation") {
    return (
      <div className="app-shell">
        <AppHeader />
        <AppNavigation />
        <Container component="main" maxWidth="md" sx={{ py: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {t("appNavigation.reputation")}
          </Typography>
          <Typography color="text.secondary">
            {t("appNavigation.comingSoon")}
          </Typography>
        </Container>
      </div>
    );
  }
  if (route === "/not-found") {
    return (
      <div className="app-shell">
        <AppHeader />
        <AppNavigation />
        <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {t("appNavigation.notFound")}
          </Typography>
        </Container>
      </div>
    );
  }
  return <TrackerLayout />;
}
