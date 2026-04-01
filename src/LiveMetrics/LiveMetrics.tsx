import { useRef } from "react";
import { motion } from "framer-motion";

import type { LiveMetricsProps, LiveMetricsTheme, RadarOptions } from "./types";
import { DEFAULT_METRICS, CARD_POSITIONS } from "./defaults";
import { DEFAULT_THEME, DEFAULT_RADAR_OPTIONS } from "./types";
import { useIsMobile, useDynamicRadarSize } from "./hooks";
import { RadarCanvas } from "./RadarCanvas";
import { ConnectorLines } from "./ConnectorLines";
import { SkeletonCard, DesktopCard, MobileCard } from "./Cards";

export default function LiveMetrics({
  metrics = DEFAULT_METRICS,        // Array of metric objects to display
  isLoading = false,                // Flag for showing loading skeletons
  radarSize = 280,                  // Base size of the radar in pixels
  mobileBreakpoint = 768,           // Width below which mobile layout is used
  cardMinWidth = 160,               // Minimum width for cards
  hideConnectorLines = false,       // Option to hide lines connecting radar to cards
  hideLiveIndicator = false,        // Option to hide live activity indicator
  theme: themeProp,                 // Optional theme overrides
  radar: radarProp,                 // Optional radar config overrides
}: LiveMetricsProps) {
  // Merge caller overrides with defaults — only keys provided override defaults
  const theme: LiveMetricsTheme = { ...DEFAULT_THEME, ...themeProp };
  const radar: RadarOptions      = { ...DEFAULT_RADAR_OPTIONS, ...radarProp };

  // Refs to all card DOM elements for drawing connector lines
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Detect if current viewport is mobile
  const isMobile = useIsMobile(mobileBreakpoint);

  // Dynamically adjust radar size based on screen and props
  const dynamicRadarSize = useDynamicRadarSize(radarSize);

  // Shared props passed to all card components
  const sharedCardProps = { theme, cardMinWidth, hideLiveIndicator };

  return (
    <>
      {/* ── MOBILE layout ── */}
      {isMobile ? (
        <div className="relative w-full flex flex-col items-center pb-10 px-4 gap-4">
          {/* Radar graphic */}
          <div
            className="relative flex-shrink-0"
            style={{ width: dynamicRadarSize * 2, height: dynamicRadarSize * 2 }}
          >
            <RadarCanvas metrics={metrics} radarRadius={dynamicRadarSize} theme={theme} radar={radar} />
          </div>

          {/* Cards below radar */}
          <div className="w-full flex flex-col gap-3">
            {isLoading
              ? metrics.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}   // Animate from below
                    animate={{ opacity: 1, y: 0 }}   // Animate to position
                    style={{ width: "100%" }}
                  >
                    <SkeletonCard style={{}} theme={theme} cardMinWidth={cardMinWidth} />
                  </motion.div>
                ))
              : metrics.map((m, i) => (
                  <MobileCard
                    key={m.id}
                    metric={m}
                    index={i}
                    cardRef={(el) => { cardRefs.current[m.id] = el; }} // Store ref for connector lines
                    {...sharedCardProps}
                  />
                ))
            }
          </div>
        </div>
      ) : (
        /* ── DESKTOP layout ── */
        <div
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{ height: "80vh" }}
        >
          <div className="relative" style={{ width: "100%", height: "100%" }}>
            {/* Radar centered in the container */}
            <div
              className="absolute"
              style={{
                width: dynamicRadarSize * 2,
                height: dynamicRadarSize * 2,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <RadarCanvas metrics={metrics} radarRadius={dynamicRadarSize} theme={theme} radar={radar} />
            </div>

            {/* Connector lines from radar to cards */}
            {!hideConnectorLines && (
              <ConnectorLines metrics={metrics} radarRadius={dynamicRadarSize} cardRefs={cardRefs} />
            )}

            {/* Cards arranged around radar */}
            {isLoading
              ? metrics.map((m) => (
                  <SkeletonCard
                    key={m.id}
                    style={{ ...CARD_POSITIONS[m.position] }} // Position using predefined layout
                    theme={theme}
                    cardMinWidth={cardMinWidth}
                  />
                ))
              : metrics.map((m) => (
                  <DesktopCard
                    key={m.id}
                    metric={m}
                    cardRef={(el) => { cardRefs.current[m.id] = el; }} // Store ref for connector lines
                    {...sharedCardProps}
                  />
                ))
            }
          </div>
        </div>
      )}
    </>
  );
}