import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import { APP_ROUTES, useAppRoute, type AppRoute } from "../../routing/app-route.ts";

const routeLabels: Record<AppRoute, MessageKey> = {
  [APP_ROUTES.raids]: "appNavigation.myRaids",
  [APP_ROUTES.characterPick]: "toolbar.export",
  [APP_ROUTES.gearPick]: "toolbar.gearPick",
  [APP_ROUTES.bisLists]: "toolbar.bisLists",
  [APP_ROUTES.addCharacter]: "toolbar.addCharacter",
  [APP_ROUTES.addRaid]: "toolbar.addDungeon",
  [APP_ROUTES.raidSettings]: "toolbar.dataControls",
  [APP_ROUTES.settings]: "appNavigation.settings",
  [APP_ROUTES.reputation]: "appNavigation.reputation",
  [APP_ROUTES.raidComposition]: "appNavigation.raidComposition",
  [APP_ROUTES.profile]: "appNavigation.profile",
  "/not-found": "appNavigation.notFound",
};

export function AppBreadcrumbs() {
  const { t } = useTranslation();
  const route = useAppRoute();
  const isRaidChild = route.startsWith(`${APP_ROUTES.raids}/`);

  return (
    <Box sx={{ mb: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
      <Breadcrumbs
        aria-label={t("appNavigation.breadcrumbsAria")}
        sx={{
          fontSize: "0.75rem",
          "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" },
          "& .MuiBreadcrumbs-li": { minWidth: 0 },
        }}
      >
        <Link component={RouterLink} to={APP_ROUTES.raids} color="text.secondary" underline="hover">
          {t("header.appTitle")}
        </Link>
        {isRaidChild ? (
          <Link component={RouterLink} to={APP_ROUTES.raids} color="text.secondary" underline="hover">
            {t("appNavigation.myRaids")}
          </Link>
        ) : null}
        <Typography color="text.primary" noWrap aria-current="page" sx={{ fontSize: "inherit" }}>
          {t(routeLabels[route])}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
}
