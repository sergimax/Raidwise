import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { APP_ROUTES, useAppRoute } from "../../routing/app-route.ts";
import { useTranslation } from "../../i18n/use-translation.ts";

export function AppNavigation() {
  const { t } = useTranslation();
  const route = useAppRoute();
  const inRaidWorkspace = route.startsWith("/raids");

  return (
    <Box
      component="nav"
      aria-label={t("appNavigation.aria")}
      sx={{ display: "flex", gap: 0.75, px: { xs: 2, sm: 3 }, py: 0.75, overflowX: "auto" }}
    >
      <Button
        component={RouterLink}
        to={APP_ROUTES.raids}
        size="small"
        variant={inRaidWorkspace ? "contained" : "text"}
        aria-current={inRaidWorkspace ? "page" : undefined}
      >
        {t("appNavigation.raids")}
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.changelog}
        size="small"
        variant={route === APP_ROUTES.changelog ? "contained" : "text"}
        aria-current={route === APP_ROUTES.changelog ? "page" : undefined}
      >
        {t("appNavigation.changelog")}
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.reputation}
        size="small"
        variant={route === APP_ROUTES.reputation ? "contained" : "text"}
        aria-current={route === APP_ROUTES.reputation ? "page" : undefined}
      >
        {t("appNavigation.reputation")}
      </Button>
    </Box>
  );
}
