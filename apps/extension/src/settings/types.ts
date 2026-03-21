export type FrontendSettings = {
  backendBaseUrl: string;
  featureFlags: Record<string, boolean>;
  helpDismissed: boolean;
};
