import type { ReactNode } from "react";

export type AppHeaderProps = {
  /** Contextual desktop navigation within the main toolbar. */
  center?: ReactNode;
  /** Direct menu items for the unified mobile navigation. */
  mobileMenuItems?: (onClose: () => void) => ReactNode;
  introVisible?: boolean;
  onToggleIntro?: () => void;
};
