import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { motion } from "framer-motion";
import type { MetricConfig } from "./types";

// Structure to store the coordinates for a connector line
interface LineData {
  id: string;     // Metric ID
  bx: number;     // X coordinate of the radar point (blip)
  by: number;     // Y coordinate of the radar point (blip)
  cx: number;     // X coordinate of the card (center)
  cy: number;     // Y coordinate of the card (center)
  color: string;  // Line color
}

// Props for the ConnectorLines component
interface ConnectorLinesProps {
  metrics: MetricConfig[];                                     // List of metrics to draw lines for
  radarRadius: number;                                         // Radius scaling factor for radar
  cardRefs: RefObject<Record<string, HTMLDivElement | null>>; // References to the metric cards
}

export function ConnectorLines({ metrics, radarRadius, cardRefs }: ConnectorLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null); // Ref for the SVG container
  const [lines, setLines] = useState<LineData[]>([]); // State to store all computed line data

  // Recalculate connector lines whenever metrics, radar radius, or cardRefs change
  useEffect(() => {
    const compute = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const svgRect = svg.getBoundingClientRect(); // Get SVG dimensions and position
      const cx = svgRect.width / 2;                // Center X of radar
      const cy = svgRect.height / 2;               // Center Y of radar

      // Map over metrics to compute line coordinates
      const computed = metrics
        .map((m): LineData | null => {
          const rad = (m.blip.angle * Math.PI) / 180; // Convert angle to radians
          const bx = cx + Math.cos(rad) * m.blip.r * radarRadius; // Blip X coordinate
          const by = cy + Math.sin(rad) * m.blip.r * radarRadius; // Blip Y coordinate

          const cardEl = cardRefs.current[m.id]; // Find the corresponding card element
          if (!cardEl) return null;             // Skip if card not yet rendered

          const cardRect = cardEl.getBoundingClientRect();
          const ccx = cardRect.left - svgRect.left + cardRect.width / 2; // Card center X
          const ccy = cardRect.top - svgRect.top + cardRect.height / 2;  // Card center Y

          return { id: m.id, bx, by, cx: ccx, cy: ccy, color: m.color };
        })
        .filter((l): l is LineData => l !== null); // Remove null entries

      setLines(computed); // Update state with calculated line data
    };

    // Compute lines once after a short delay (for initial render)
    const timer = setTimeout(compute, 100);

    // Recompute lines on window resize to stay responsive
    window.addEventListener("resize", compute);

    // Cleanup: clear timer and remove event listener
    return () => { 
      clearTimeout(timer); 
      window.removeEventListener("resize", compute); 
    };
  }, [metrics, radarRadius, cardRefs]);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        {/* Create glow filters for each line */}
        {lines.map((l) => (
          <filter key={`glow-${l.id}`} id={`glow-${l.id}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* Draw the connector lines */}
      {lines.map((l) => {
        const metric = metrics.find((m) => m.id === l.id);

        // If the metric is disconnected, draw a faint dashed gray line
        if (metric?.disconnected) {
          return (
            <line
              key={l.id}
              x1={l.bx} y1={l.by} x2={l.cx} y2={l.cy}
              stroke="rgba(150,150,150,0.25)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        }

        // Otherwise, draw an animated colored line with glow
        return (
          <motion.line
            key={l.id}
            x1={l.bx} y1={l.by} x2={l.cx} y2={l.cy}
            stroke={l.color}
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeDasharray="4 4"
            filter={`url(#glow-${l.id})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}