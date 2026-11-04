import { Box, Button, Tab, Tabs } from "@mui/material";
import { memo, useMemo } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { buildTrackerActions } from "./actions.ts";
import type { TrackerControlsSource } from "./types.ts";

type TrackerControlsProps = {
  source: TrackerControlsSource;
};

export const TrackerControls = memo(function TrackerControls({
  source,
}: TrackerControlsProps) {
  const { t } = useTranslation();
  const actions = useMemo(() => buildTrackerActions(source, t), [source, t]);

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", minWidth: 0, flex: 1, alignSelf: "stretch" }}>
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
        scrollButtons="auto"
        sx={{
          minWidth: 0,
          minHeight: 48,
          height: 48,
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
                minHeight: 48,
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
