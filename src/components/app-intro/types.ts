export type AppIntroProps = {
  /** When false, the intro block is not rendered. */
  visible?: boolean;
  /** Hide the intro (scenario C / BiS-only, or when the help is no longer needed). */
  onDismiss?: () => void;
};
