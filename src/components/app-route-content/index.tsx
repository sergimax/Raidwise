import { Container, Typography } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "../../i18n/use-translation.ts";
import { APP_ROUTES, RAID_WORKSPACE_ROUTES } from "../../routing/app-route.ts";
import type { MessageKey } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppBreadcrumbs } from "../app-breadcrumbs/index.tsx";
import { AppSettingsPage } from "../app-settings-page/index.tsx";
import { loadRouteModule } from "../../routing/load-route-module.ts";

const TrackerLayout = lazy(() => loadRouteModule(async () => ({
  default: (await import("../tracker-layout/index.tsx")).TrackerLayout,
})));

function RaidWorkspace() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<Typography role="status">{t("appNavigation.loadingRaids")}</Typography>}>
      <TrackerLayout />
    </Suspense>
  );
}

function ComingSoonPage({ title }: { title: MessageKey }) {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <AppHeader />
      <Container className="app-page-main" component="main" maxWidth="md" sx={{ pb: 3 }}>
        <AppBreadcrumbs />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          {t(title)}
        </Typography>
        <Typography color="text.secondary">
          {t("appNavigation.comingSoon")}
        </Typography>
      </Container>
    </div>
  );
}

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <AppHeader />
      <Container className="app-page-main" component="main" maxWidth="sm" sx={{ pb: 6 }}>
        <AppBreadcrumbs />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          {t("appNavigation.notFound")}
        </Typography>
      </Container>
    </div>
  );
}

export function AppRouteContent() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={APP_ROUTES.raids} replace />} />
      {RAID_WORKSPACE_ROUTES.map((path) => (
        <Route key={path} path={path} caseSensitive element={<RaidWorkspace />} />
      ))}
      <Route path="settings" element={<AppSettingsPage />} />
      <Route path="changelog" element={<Navigate to={APP_ROUTES.settings} replace />} />
      <Route path="reputation" element={<ComingSoonPage title="appNavigation.reputation" />} />
      <Route path="raid-composition" element={<ComingSoonPage title="appNavigation.raidComposition" />} />
      <Route path="profile" element={<ComingSoonPage title="appNavigation.profile" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
