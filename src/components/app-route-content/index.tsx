import { Container, Typography } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "../../i18n/use-translation.ts";
import { APP_ROUTES } from "../../routing/app-route.ts";
import type { MessageKey } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppSettingsPage } from "../app-settings-page/index.tsx";
import { TrackerLayout } from "../tracker-layout/index.tsx";

function ComingSoonPage({ title }: { title: MessageKey }) {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <AppHeader />
      <Container component="main" maxWidth="md" sx={{ py: 3 }}>
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
      <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
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
      <Route path="raids/*" element={<TrackerLayout />} />
      <Route path="settings" element={<AppSettingsPage />} />
      <Route path="changelog" element={<Navigate to={APP_ROUTES.settings} replace />} />
      <Route path="reputation" element={<ComingSoonPage title="appNavigation.reputation" />} />
      <Route path="raid-composition" element={<ComingSoonPage title="appNavigation.raidComposition" />} />
      <Route path="profile" element={<ComingSoonPage title="appNavigation.profile" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
