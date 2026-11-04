import type { ReactNode } from "react";

export type AppHeaderProps = {
  /** Contextual navigation within the main toolbar at every screen width. */
  center?: ReactNode;
  /** Direct menu items for the unified mobile navigation. */
  mobileMenuItems?: (onClose: () => void) => ReactNode;
  introVisible?: boolean;
  onToggleIntro?: () => void;
};
