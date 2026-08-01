import type { ReactNode } from "react";

export type AppHeaderProps = {
  /** Tracker actions in the toolbar center (flexGrow), like MUI responsive AppBar nav. */
  center?: ReactNode;
  /** Whether the usage-help intro panel is currently visible. */
  introVisible?: boolean;
  /** Toggle the usage-help intro panel (header info button). */
  onToggleIntro?: () => void;
};
