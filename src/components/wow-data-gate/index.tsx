import { Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useWowDataReady } from "../../hooks/use-wow-data-ready.ts";
import { useTranslation } from "../../i18n/use-translation.ts";

export function WowDataGate({ children }: { children: ReactNode }) {
  const { hintStatus } = useWowDataReady();
  const { t } = useTranslation();
  if (hintStatus === "ready") return children;
  const unavailable = hintStatus === "failed" || hintStatus === "missing";
  return (
    <Typography role="status" color="text.secondary" sx={{ p: 2 }}>
      {t(unavailable ? "wowData.toolUnavailable" : "wowData.loading")}
    </Typography>
  );
}
