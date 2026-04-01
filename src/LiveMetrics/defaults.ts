import type { MetricConfig, CardPosition } from "./types";

// ─── Default Metrics ──────────────────────────────────────────────────────────
// An array of metric objects representing different system statistics to display.

export const DEFAULT_METRICS: MetricConfig[] = [
  {
    id: "threats",
    label: "Threats Blocked",
    value: 1247,
    color: "#1AA1E1",
    glowColor: "rgba(0,229,255,0.6)",
    position: "top-right",
    blip: { angle: 1, r: 0.75 }, // angle in degrees, r = distance from radar center (0-1)
  },
  {
    id: "logs",
    label: "Logs Analyzed",
    value: 1200,
    color: "#7c6aff",
    glowColor: "rgba(124,106,255,0.6)",
    position: "bottom-right",
    blip: { angle: 50, r: 0.48 },
  },
  {
    id: "vulns",
    label: "Vulnerabilities Fixed",
    value: 56,
    color: "#7FADC4",
    glowColor: "rgba(0,255,179,0.6)",
    position: "left",
    blip: { angle: 215, r: 0.44 },
  },
  {
    id: "alerts",
    label: "Alerts Triggered",
    value: 102,
    color: "#D94D20",
    glowColor: "rgba(255,107,138,0.6)",
    position: "top",
    blip: { angle: 320, r: 0.58 },
  },
  {
    id: "incidents",
    label: "Incidents Resolved",
    value: 28,
    color: "#EF588B",
    glowColor: "rgba(240,165,0,0.6)",
    position: "bottom",
    blip: { angle: 150, r: 0.65 },
  },
];

// ─── Card Positions ───────────────────────────────────────────────────────────
// Defines CSS styles for positioning each metric card relative to the radar.
// Each position corresponds to a key used in DEFAULT_METRICS.position.
// Using absolute positioning with optional transform adjustments for centering.
export const CARD_POSITIONS: Record<CardPosition, React.CSSProperties> = {
  top:            { top: "2%",    left: "68%",  transform: "translateX(-50%)" }, 
  "top-right":    { top: "44%",   right: "16%" },                                 
  "bottom-right": { bottom: "2%", right: "22%" },                                
  bottom:         { bottom: "2%", left: "20%",  transform: "translateX(-50%)" }, 
  left:           { top: "6%",   left: "18%",   transform: "translateY(-50%)" }, 
};