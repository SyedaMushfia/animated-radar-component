// Main component
export { default as LiveMetrics } from "./LiveMetrics";

// Types — re-export everything a client needs to type their props
export type {
  LiveMetricsProps,
  LiveMetricsTheme,
  MetricConfig,
  BlipConfig,
  CardPosition,
  StatusItem,
  RadarOptions,
} from "./types";

// Defaults — exposed so clients can spread and override individual metrics
export { DEFAULT_METRICS } from "./defaults";
export { DEFAULT_THEME, DEFAULT_RADAR_OPTIONS } from "./types";