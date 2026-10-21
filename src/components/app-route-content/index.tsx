import { Container, Typography } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "../../i18n/use-translation.ts";
import { APP_ROUTES } from "../../routing/app-route.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppNavigation } from "../app-navigation/index.tsx";
import { ChangelogPage } from "../changelog-page/index.tsx";
import { TrackerLayout } from "../tracker-layout/index.tsx";

function ReputationPage() {
  const { t } = useTranslation();
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

function NotFoundPage() {
  const { t } = useTranslation();
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

export function AppRouteContent() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={APP_ROUTES.raids} replace />} />
      <Route path="raids/*" element={<TrackerLayout />} />
      <Route path="changelog" element={<ChangelogPage />} />
      <Route path="reputation" element={<ReputationPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
