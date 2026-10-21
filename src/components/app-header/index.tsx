import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { AppMetaInfo, AppVersionLabel } from "../app-meta-info/index.tsx";
import { AppIntroToggle } from "../app-intro-toggle/index.tsx";
import { ItemTooltipLocaleToggle } from "../item-tooltip-locale-toggle/index.tsx";
import { ThemeModeToggle } from "../theme-mode-toggle/index.tsx";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  appThemeTokens,
  fontFamilyDisplay,
} from "../../theme/create-app-theme.ts";
import type { AppHeaderProps } from "./types.ts";
import { APP_ROUTES, useAppRoute } from "../../routing/app-route.ts";

export type { AppHeaderProps } from "./types.ts";

export function AppHeader({
  center,
  introVisible = false,
  onToggleIntro,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const route = useAppRoute();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const navItems = [
    { to: APP_ROUTES.raids, label: t("appNavigation.myRaids") },
    { to: APP_ROUTES.reputation, label: t("appNavigation.reputation"), disabled: true },
    { to: APP_ROUTES.raidComposition, label: t("appNavigation.raidComposition"), disabled: true },
    { to: APP_ROUTES.profile, label: t("appNavigation.profile"), disabled: true },
    { to: APP_ROUTES.settings, label: t("appNavigation.settings") },
  ];
  const currentItem = navItems.find(({ to }) => to === route)
    ?? (route.startsWith("/raids/") ? navItems[0] : undefined);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={(theme) => ({
        bgcolor: appThemeTokens[theme.palette.mode].headerBg,
        backdropFilter: "saturate(1.2) blur(12px)",
        WebkitBackdropFilter: "saturate(1.2) blur(12px)",
        borderBottom: 1,
        borderColor: "divider",
      })}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar
          disableGutters
          sx={{
            gap: { xs: 1, sm: 2 },
            minHeight: "var(--app-toolbar-min-height)",
            flexWrap: "nowrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              mr: 1,
            }}
          >
            <Box
              component="img"
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt=""
              aria-hidden
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
              }}
            />
            <Typography
              component="h1"
              variant="h6"
              noWrap
              sx={(theme) => ({
                fontFamily: fontFamilyDisplay,
                fontWeight: 700,
                color: appThemeTokens[theme.palette.mode].brand,
                fontSize: { xs: "1rem", sm: "1.2rem" },
                display: { xs: "none", sm: "block" },
              })}
            >
              {t("header.appTitle")}
            </Typography>
            <Button
              size="small"
              color="inherit"
              aria-label={t("appNavigation.menu")}
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor)}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              endIcon={<ExpandMoreIcon />}
              sx={{
                minWidth: 0,
                maxWidth: { xs: 132, sm: 180 },
                px: 0.75,
                fontSize: { xs: "0.72rem", sm: "0.8rem" },
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentItem?.label ?? t("appNavigation.menu")}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{ list: { "aria-label": t("appNavigation.menu") } }}
            >
              {navItems.map(({ to, label, disabled }) =>
                disabled ? (
                  <MenuItem key={to} disabled>
                    {label}
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={to}
                    component={RouterLink}
                    to={to}
                    selected={route === to || (to === APP_ROUTES.raids && route.startsWith("/raids/"))}
                    aria-current={route === to ? "page" : undefined}
                    onClick={() => setMenuAnchor(null)}
                  >
                    {label}
                  </MenuItem>
                ),
              )}
            </Menu>
          </Box>

          {center ? (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-end", md: "center" },
                flexWrap: "nowrap",
                gap: 1,
                minWidth: 0,
              }}
            >
              {center}
            </Box>
          ) : null}

          <Box
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              gap: 0.25,
            }}
          >
            {onToggleIntro ? (
              <AppIntroToggle
                introVisible={introVisible}
                onToggle={onToggleIntro}
              />
            ) : null}
            <ThemeModeToggle />
            <ItemTooltipLocaleToggle />
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.25 }}>
              <AppMetaInfo />
              <AppVersionLabel />
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
