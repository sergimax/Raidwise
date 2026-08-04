import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { AppMetaInfo, AppVersionLabel } from "../app-meta-info/index.tsx";
import { AppIntroToggle } from "../app-intro-toggle/index.tsx";
import { ItemTooltipLocaleToggle } from "../item-tooltip-locale-toggle/index.tsx";
import { ThemeModeToggle } from "../theme-mode-toggle/index.tsx";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  fontFamilyDisplay,
  superThemeTokens,
} from "../../theme/create-app-theme.ts";
import type { AppHeaderProps } from "./types.ts";

export type { AppHeaderProps } from "./types.ts";

export function AppHeader({
  center,
  introVisible = false,
  onToggleIntro,
}: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={(theme) => ({
        bgcolor: superThemeTokens[theme.palette.mode].headerBg,
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
                color: superThemeTokens[theme.palette.mode].brand,
                fontSize: { xs: "1rem", sm: "1.2rem" },
              })}
            >
              {t("header.appTitle")}
            </Typography>
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
              flexGrow: 0,
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
            <ItemTooltipLocaleToggle />
            <ThemeModeToggle />
            <AppMetaInfo />
            <AppVersionLabel />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
