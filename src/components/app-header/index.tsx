import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AppBar, Box, Button, Container, Divider, IconButton, ListSubheader, Menu, MenuItem, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useId, useState } from "react";
import { AppIntroToggle } from "../app-intro-toggle/index.tsx";
import { AppVersionLabel } from "../app-meta-info/index.tsx";
import { ItemTooltipLocaleToggle } from "../item-tooltip-locale-toggle/index.tsx";
import { useTranslation } from "../../i18n/use-translation.ts";
import { appThemeTokens, fontFamilyDisplay } from "../../theme/create-app-theme.ts";
import type { AppHeaderProps } from "./types.ts";
import { APP_ROUTES, useAppRoute } from "../../routing/app-route.ts";

export type { AppHeaderProps } from "./types.ts";

export function AppHeader({ center, mobileMenuItems, introVisible = false, onToggleIntro }: AppHeaderProps) {
  const { t } = useTranslation();
  const route = useAppRoute();
  const theme = useTheme();
  const desktop = !useMediaQuery(theme.breakpoints.down("md"));
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const closeMenu = () => setMenuAnchor(null);
  const navItems = [
    { to: APP_ROUTES.raids, label: t("appNavigation.myRaids") },
    { to: APP_ROUTES.reputation, label: t("appNavigation.reputation"), disabled: true },
    { to: APP_ROUTES.raidComposition, label: t("appNavigation.raidComposition"), disabled: true },
    { to: APP_ROUTES.profile, label: t("appNavigation.profile"), disabled: true },
    { to: APP_ROUTES.settings, label: t("appNavigation.settings") },
  ];
  const isSelected = (to: string) => route === to || (to === APP_ROUTES.raids && route.startsWith("/raids/"));

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className="app-header"
      sx={{ bgcolor: appThemeTokens[theme.palette.mode].headerBg, borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ gap: { xs: 1, md: 1.5 }, minHeight: "var(--app-toolbar-min-height) !important" }}>
          {!desktop ? <IconButton
            color="inherit"
            edge="start"
            aria-label={t("appNavigation.menu")}
            aria-controls={menuOpen ? menuId : undefined}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton> : null}
          <Typography
            component={RouterLink}
            className="app-nav-link"
            to={APP_ROUTES.raids}
            variant="h6"
            noWrap
            sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              fontFamily: fontFamilyDisplay, fontWeight: 700,
              color: "secondary.main", textDecoration: "none",
              fontSize: { xs: "1rem", sm: "1.2rem" }, flexShrink: 0,
            }}
          >
            <Box component="img" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" aria-hidden sx={{ width: { xs: 26, sm: 32 }, height: { xs: 26, sm: 32 } }} />
            {t("header.appTitle")}
          </Typography>
          {desktop ? (
            <Button
              color="inherit"
              endIcon={<ExpandMoreIcon />}
              aria-label={t("appNavigation.menu")}
              aria-controls={menuOpen ? menuId : undefined}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ whiteSpace: "nowrap", flexShrink: 0, color: "secondary.main", bgcolor: "var(--brand-soft)" }}
            >
              {navItems.find(({ to }) => isSelected(to))?.label ?? t("appNavigation.menu")}
            </Button>
          ) : null}
          {center && desktop ? (
            <Box component="nav" aria-label={t("toolbar.actionsAria")} sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              {center}
            </Box>
          ) : null}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {onToggleIntro ? <AppIntroToggle introVisible={introVisible} onToggle={onToggleIntro} /> : null}
            <ItemTooltipLocaleToggle />
            <Box sx={{ display: { xs: "none", sm: "flex" }, ml: 0.5 }}><AppVersionLabel /></Box>
          </Box>
        </Toolbar>
      </Container>
      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          list: { "aria-label": t("appNavigation.menu") },
          paper: { sx: { minWidth: 240, maxHeight: "calc(100dvh - 80px)" } },
          transition: { onExited: closeMenu },
        }}
      >
        {navItems.map(({ to, label, disabled }) => (
          <MenuItem key={to} component={RouterLink} className="app-nav-link" to={to} disabled={disabled} selected={isSelected(to)} aria-current={isSelected(to) ? "page" : undefined} onClick={closeMenu}>
            {label}
          </MenuItem>
        ))}
        {!desktop && mobileMenuItems ? <Divider /> : null}
        {!desktop && mobileMenuItems ? <ListSubheader>{t("toolbar.actionsAria")}</ListSubheader> : null}
        {!desktop ? mobileMenuItems?.(closeMenu) : null}
      </Menu>
    </AppBar>
  );
}
