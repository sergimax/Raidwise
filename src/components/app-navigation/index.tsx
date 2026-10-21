import { Box, Button } from "@mui/material";
import { APP_ROUTES, getAppHref, navigateTo, useAppRoute } from "../../routing/app-route.ts";
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
        component="a"
        href={getAppHref(APP_ROUTES.raids)}
        size="small"
        variant={inRaidWorkspace ? "contained" : "text"}
        aria-current={inRaidWorkspace ? "page" : undefined}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          navigateTo(APP_ROUTES.raids);
        }}
      >
        {t("appNavigation.raids")}
      </Button>
      <Button
        component="a"
        href={getAppHref(APP_ROUTES.changelog)}
        size="small"
        variant={route === APP_ROUTES.changelog ? "contained" : "text"}
        aria-current={route === APP_ROUTES.changelog ? "page" : undefined}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          navigateTo(APP_ROUTES.changelog);
        }}
      >
        {t("appNavigation.changelog")}
      </Button>
      <Button
        component="a"
        href={getAppHref(APP_ROUTES.reputation)}
        size="small"
        variant={route === APP_ROUTES.reputation ? "contained" : "text"}
        aria-current={route === APP_ROUTES.reputation ? "page" : undefined}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          navigateTo(APP_ROUTES.reputation);
        }}
      >
        {t("appNavigation.reputation")}
      </Button>
    </Box>
  );
}
