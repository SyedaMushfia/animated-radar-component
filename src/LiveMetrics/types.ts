// ─── THEME ──────────────────────────────────────────────────────────────────

/**
 * Theme tokens that control the visual appearance of the entire component.
 * All colors accept any valid CSS color string (hex, rgba, hsl, etc.).
 */
export interface LiveMetricsTheme {
  /**
   * Primary accent color used for radar rings, sweep arm, center glow,
   * skeleton shimmer, and connector line glow.
   * @default "#00E5FF"
   */
  accentColor: string;

  /**
   * Card surface background (supports transparency for glass effect).
   * @default "rgba(6,18,40,0.5)"
   */
  cardBackground: string;

  /**
   * Card text color for the metric label.
   * @default "#D9D9D9"
   */
  cardLabelColor: string;

  /**
   * Card text color for the numeric value.
   * @default "#f0f8ff"
   */
  cardValueColor: string;

  /**
   * Card border-radius in px.
   * @default 12
   */
  cardBorderRadius: number;

  /**
   * Font family applied to cards. Pass a Google Fonts name after loading it
   * yourself, or any system font stack.
   * @default "inherit"
   */
  fontFamily: string;

  /**
   * Color used for the error banner icon, border, and text.
   * @default "#D94D20"
   */
  errorColor: string;
}

export const DEFAULT_THEME: LiveMetricsTheme = {
  accentColor: "#00E5FF",
  cardBackground: "rgba(6,18,40,0.5)",
  cardLabelColor: "#D9D9D9",
  cardValueColor: "#f0f8ff",
  cardBorderRadius: 12,
  fontFamily: "inherit",
  errorColor: "#D94D20",
};

// ─── RADAR ──────────────────────────────────────────────────────────────────

export interface RadarOptions {
  /**
   * Number of concentric rings drawn on the radar.
   * @default 5
   */
  ringCount: number;

  /**
   * Rotation speed of the sweep arm. Higher = faster.
   * 0 pauses the sweep entirely (static radar).
   * @default 0.012
   */
  sweepSpeed: number;

  /**
   * Whether to render the sweep arm and its tail gradient at all.
   * @default true
   */
  showSweep: boolean;
}

export const DEFAULT_RADAR_OPTIONS: RadarOptions = {
  ringCount: 5,
  sweepSpeed: 0.012,
  showSweep: true,
};

// ─── BLIP ────────────────────────────────────────────────────────────────────

export interface BlipConfig {
  /** Angle in degrees (0 = right, 90 = down). */
  angle: number;
  /** Fractional distance from center (0 = center, 1 = edge). */
  r: number;
}

// ─── METRIC ──────────────────────────────────────────────────────────────────

export type CardPosition =
  | "top"
  | "top-right"
  | "bottom-right"
  | "bottom"
  | "left";

export interface MetricConfig {
  /** Unique identifier — used as React key and ref key. */
  id: string;
  /** Human-readable label shown above the number. */
  label: string;
  /** Numeric value. Changing this re-triggers the count-up animation. */
  value: number;
  /** Primary color for the blip, card border, and live dot. */
  color: string;
  /** Glow color for card box-shadow (should be a semi-transparent version of `color`). */
  glowColor: string;
  /** Desktop card position slot. */
  position: CardPosition;
  /** Where on the radar to place the blip. */
  blip: BlipConfig;
  /**
   * When true, dims the card, grays the blip, shows "stale" instead of "live",
   * and renders the connector line as a muted dashed line.
   */
  disconnected?: boolean;
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────

export interface StatusItem {
  label: string;
  value: string;
}

// ─── MAIN PROPS ──────────────────────────────────────────────────────────────

export interface LiveMetricsProps {
  // ── Data
  metrics?: MetricConfig[];

  // ── State
  /** Shows skeleton cards while true. */
  isLoading?: boolean;
  /** Renders a global error banner when non-null. Set to null to dismiss. */
  feedError?: string | null;

  // ── Layout
  /**
   * Base radar radius in px. The component auto-scales this down on smaller
   * viewports; this value is only used at ≥ 1024 px wide.
   * @default 280
   */
  radarSize?: number;

  /**
   * Pixel width below which the component switches to the stacked mobile layout.
   * @default 768
   */
  mobileBreakpoint?: number;

  /**
   * Minimum width of each metric card in px.
   * @default 160
   */
  cardMinWidth?: number;

  // ── Display toggles
  /**
   * Hide the dashed connector lines between blips and cards.
   * @default false
   */
  hideConnectorLines?: boolean;

  /**
   * Hide the pulsing "live" / "stale" status indicator at the bottom of each card.
   * @default false
   */
  hideLiveIndicator?: boolean;

  // ── Theming
  /**
   * Partial theme — only the keys you provide override the defaults.
   * @example { accentColor: "#FF6B35", cardBorderRadius: 6 }
   */
  theme?: Partial<LiveMetricsTheme>;

  /**
   * Radar-specific options.
   */
  radar?: Partial<RadarOptions>;
}