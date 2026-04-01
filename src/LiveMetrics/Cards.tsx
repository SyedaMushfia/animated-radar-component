import { motion } from "framer-motion";
import { useCountUp } from "./hooks";
import type { MetricConfig, LiveMetricsTheme } from "./types";
import { CARD_POSITIONS } from "./defaults";

// ─── SKELETON ────────────────────────────────────────────────────────────────
// Placeholder card shown while data is loading
// Uses a pulsing animation to simulate content loading

interface SkeletonCardProps {
  style?: React.CSSProperties; // Absolute positioning styles
  theme: LiveMetricsTheme;     // Theme config for styling
  cardMinWidth: number;        // Minimum width to maintain layout consistency
}

export function SkeletonCard({ style, theme, cardMinWidth }: SkeletonCardProps) {
  const accent = theme.accentColor;

  return (
    <motion.div
      // Fade in and loop opacity for shimmer effect
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute"
      style={{
        ...style,
        zIndex: 10,
        minWidth: cardMinWidth,
        background: theme.cardBackground,
        border: `1px solid ${accent}1e`,
        backdropFilter: "blur(12px)",
        borderRadius: theme.cardBorderRadius,
        padding: "14px 20px",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Fake text lines to mimic loading content */}
      <div style={{ height: 10, width: "70%", borderRadius: 4, background: `${accent}26`, marginBottom: 10 }} />
      <div style={{ height: 28, width: "55%", borderRadius: 4, background: `${accent}1a`, marginBottom: 10 }} />
      <div style={{ height: 8,  width: "30%", borderRadius: 4, background: `${accent}14` }} />
    </motion.div>
  );
}

// ─── CARD INNER ──────────────────────────────────────────────────────────────
// Core reusable card UI used by both Desktop and Mobile layouts
// Handles:
// - Animated number counting
// - Live/Disconnected indicator
// - Theming and styling

interface CardInnerProps {
  metric: MetricConfig;                         // Metric data (value, label, color, etc.)
  divRef: (el: HTMLDivElement | null) => void;  // Ref for measuring or positioning
  fontSize?: number;                            // Value font size (responsive control)
  padding?: string;                             // Card padding
  theme: LiveMetricsTheme;                      // Theme config
  cardMinWidth: number;                         // Minimum width
  hideLiveIndicator: boolean;                   // Toggle live/stale indicator
}

export function CardInner({
  metric,
  divRef,
  fontSize = 36,
  padding = "14px 20px",
  theme,
  cardMinWidth,
  hideLiveIndicator,
}: CardInnerProps) {

  // Animated counter hook (smooth number transitions)
  const count = useCountUp(metric.value);

  // Status indicator (live or stale)
  const statusIndicator = metric.disconnected ? (
    // ── DISCONNECTED STATE ──
    <div className="flex items-center gap-1.5">
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "rgba(150,150,150,0.4)",
        display: "inline-block",
        border: "1px solid rgba(150,150,150,0.6)",
      }} />
      <span className="text-xs" style={{ color: "rgba(150,150,150,0.7)", letterSpacing: 1 }}>
        disconnected
      </span>
    </div>
  ) : (
    // ── LIVE STATE ──
    <div className="flex items-center gap-1.5">
      <motion.span
        // Pulsing dot animation
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: metric.color,
          boxShadow: `0 0 6px ${metric.color}`,
          display: "inline-block",
        }}
      />
      <span className="text-xs" style={{ color: `${metric.color}99`, letterSpacing: 1 }}>
        live
      </span>
    </div>
  );

  return (
    <div
      ref={divRef}
      style={{
        background: theme.cardBackground,

        // Border changes based on connection state
        border: `1px solid ${
          metric.disconnected
            ? "rgba(150,150,150,0.2)"
            : `${metric.color}30`
        }`,

        backdropFilter: "blur(12px)",
        borderRadius: theme.cardBorderRadius,
        padding,
        minWidth: cardMinWidth,

        // Glow effect only when active
        boxShadow: metric.disconnected
          ? "none"
          : `0 0 24px ${metric.glowColor}22, inset 0 1px 0 ${metric.color}15`,

        // Dim card when disconnected
        opacity: metric.disconnected ? 0.55 : 1,
        transition: "opacity 0.4s ease, border 0.4s ease",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Metric label */}
      <p className="text-xs tracking-widest font-semibold mb-1" style={{ color: theme.cardLabelColor }}>
        {metric.label.toUpperCase()}
      </p>

      {/* Animated value */}
      <p className="font-bold leading-none mb-2" style={{
        color: theme.cardValueColor,
        fontSize,
        letterSpacing: -1
      }}>
        {count.toLocaleString()}
      </p>

      {/* Live/disconnected indicator */}
      {!hideLiveIndicator && statusIndicator}
    </div>
  );
}

// ─── DESKTOP CARD ────────────────────────────────────────────────────────────
// Positioned around the radar using predefined absolute positions

interface DesktopCardProps {
  metric: MetricConfig;
  cardRef: (el: HTMLDivElement | null) => void;
  theme: LiveMetricsTheme;
  cardMinWidth: number;
  hideLiveIndicator: boolean;
}


export function DesktopCard({
  metric,
  cardRef,
  theme,
  cardMinWidth,
  hideLiveIndicator
}: DesktopCardProps) {
  return (
    <motion.div
      // Smooth entrance animation
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute"
      style={{
        ...CARD_POSITIONS[metric.position], // Predefined layout positions
        zIndex: 10
      }}
    >
      <CardInner
        metric={metric}
        divRef={cardRef}
        theme={theme}
        cardMinWidth={cardMinWidth}
        hideLiveIndicator={hideLiveIndicator}
      />
    </motion.div>
  );
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
// Stacked layout for smaller screens (no absolute positioning)

interface MobileCardProps {
  metric: MetricConfig;
  cardRef: (el: HTMLDivElement | null) => void;
  index: number;               // Used for staggered animation
  theme: LiveMetricsTheme;
  cardMinWidth: number;
  hideLiveIndicator: boolean;
}

export function MobileCard({
  metric,
  cardRef,
  index,
  theme,
  cardMinWidth,
  hideLiveIndicator
}: MobileCardProps) {
  return (
    <motion.div
      // Slide-up + fade animation with stagger
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
        delay: index * 0.07 // Stagger effect
      }}
      style={{ width: "100%" }}
    >
      <CardInner
        metric={metric}
        divRef={cardRef}
        fontSize={28}          // Smaller text for mobile
        padding="12px 16px"    // Compact spacing
        theme={theme}
        cardMinWidth={cardMinWidth}
        hideLiveIndicator={hideLiveIndicator}
      />
    </motion.div>
  );
}