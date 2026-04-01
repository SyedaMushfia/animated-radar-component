import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/**
 * Custom hook to animate a number counting up from 0 to a target value.
 * Useful for stats, metrics, or any live numeric display.
 * 
 * @param target - The number to count up to
 * @param duration - Animation duration in milliseconds (default: 1800ms)
 * @returns The current animated number
 */
export function useCountUp(target: number, duration = 1800): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Start the animation from 0 to the target value
    const controls = animate(0, target, {
      duration: duration / 1000, // framer-motion expects seconds
      ease: "easeOut",           // easing function for smooth effect
      onUpdate: (v: number) => setCount(Math.floor(v)), // update state on each frame
    });

    // Cleanup function to stop the animation if component unmounts or target changes
    return controls.stop;
  }, [target, duration]);

  return count;
}

/**
 * Custom hook to detect if the viewport is below a specified mobile breakpoint.
 * Useful for responsive components and layout changes.
 * 
 * @param breakpoint - The width (in pixels) below which the device is considered mobile
 * @returns Boolean indicating if the viewport is mobile
 */
export function useIsMobile(breakpoint: number): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);

    check(); // initial check on mount
    window.addEventListener("resize", check); // update on window resize

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Custom hook to dynamically adjust radar/chart size based on window width.
 * Helps maintain a responsive visual design for radar or circular charts.
 * 
 * @param baseSize - Default size for larger screens
 * @returns The current size to use for the radar/chart
 */
export function useDynamicRadarSize(baseSize: number): number {
  const [size, setSize] = useState(baseSize);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      // Adjust size based on common device breakpoints
      if (w < 480)       setSize(130);       // small mobile
      else if (w < 768)  setSize(160);       // large mobile / small tablet
      else if (w < 1024) setSize(200);       // tablet / medium screens
      else               setSize(baseSize);  // desktop / large screens
    };

    update(); // initial check on mount
    window.addEventListener("resize", update); // update on window resize

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", update);
  }, [baseSize]);

  return size;
}