import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, IconButton, Menu, Tab, Tabs } from "@mui/material";
import { memo, useCallback, useId, useMemo, useState, type MouseEvent } from "react";
import { useCompactLayout } from "../../hooks/use-compact-layout.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { buildTrackerActions } from "./actions.ts";
import { renderTrackerAction } from "./render-tracker-action.tsx";
import type { TrackerControlsSource } from "./types.ts";

type TrackerControlsProps = {
  source: TrackerControlsSource;
};

export const TrackerControls = memo(function TrackerControls({
  source,
}: TrackerControlsProps) {
  const { t } = useTranslation();
  const actions = useMemo(() => buildTrackerActions(source, t), [source, t]);

  const menuLayout = useCompactLayout();
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const openMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  if (menuLayout) {
    return (
      <>
        <IconButton
          size="small"
          color="inherit"
          aria-label={t("toolbar.actionsAria")}
          aria-controls={menuOpen ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <Menu
          id={menuId}
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {actions.map((action) =>
            renderTrackerAction(action, "menuItem", { onAfterClick: closeMenu }),
          )}
        </Menu>
      </>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", minWidth: 0, alignSelf: "stretch" }}>
      {actions.some((action) => action.id === "addFromTemplate" && action.visible !== false) ? (
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={() => actions.find((action) => action.id === "addFromTemplate")?.onClick()}
          sx={{ whiteSpace: "nowrap" }}
        >
          {actions.find((action) => action.id === "addFromTemplate")?.label}
        </Button>
      ) : null}
      <Tabs
        value={actions.find((action) => action.selected && action.visible !== false)?.id ?? false}
        onChange={(_, value: string) => actions.find((action) => action.id === value)?.onClick()}
        aria-label={t("toolbar.actionsAria")}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 52,
          height: 52,
          "& .MuiTabs-flexContainer": { gap: { xs: 0, sm: 0.5 } },
          "& .MuiTabs-indicator": { height: 2, bgcolor: "secondary.main" },
        }}
      >
        {actions
          .filter((action) => action.id !== "addFromTemplate" && action.visible !== false)
          .map((action) => (
            <Tab
              key={action.id}
              value={action.id}
              label={action.label}
              disabled={action.disabled}
              aria-expanded={action.ariaExpanded}
              sx={{
                minWidth: 0,
                minHeight: 52,
                px: { xs: 1, sm: 1.25 },
                py: 0.75,
                fontSize: { xs: "0.72rem", sm: "0.8rem" },
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            />
          ))}
      </Tabs>
    </Box>
  );
});
