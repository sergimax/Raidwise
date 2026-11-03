import type { ReactNode } from "react";

export type AppHeaderProps = {
  /** Tracker actions in the toolbar center (flexGrow), like MUI responsive AppBar nav. */
  center?: ReactNode;
  introVisible?: boolean;
  onToggleIntro?: () => void;
};
