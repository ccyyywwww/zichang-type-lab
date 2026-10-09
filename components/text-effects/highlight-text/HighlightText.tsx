import { createElement } from "react";
import type { HighlightTextProps, HighlightTextStyle } from "./types";

export const highlightTextDefaults = {
  bandColor: "#d9ff57",
  bandThickness: 35,
  bandStart: 0,
  bandEnd: 0,
  bandOffset: 5,
  bandAngle: -7,
  bandRadius: 3,
  direction: "left",
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HighlightText({
  children,
  as = "span",
  className = "",
  duration = 1.8,
  delay = 0,
  paused = false,
  bandColor = highlightTextDefaults.bandColor,
  bandThickness = highlightTextDefaults.bandThickness,
  bandStart = highlightTextDefaults.bandStart,
  bandEnd = highlightTextDefaults.bandEnd,
  bandOffset = highlightTextDefaults.bandOffset,
  bandAngle = highlightTextDefaults.bandAngle,
  bandRadius = highlightTextDefaults.bandRadius,
  direction = highlightTextDefaults.direction,
  style,
  "aria-label": ariaLabel,
}: HighlightTextProps) {
  const highlightStyle: HighlightTextStyle = {
    "--zc-highlight-color": bandColor,
    "--zc-highlight-thickness": `${clamp(bandThickness, 1, 120)}%`,
    "--zc-highlight-start": `${clamp(bandStart, 0, 80)}%`,
    "--zc-highlight-end": `${clamp(bandEnd, 0, 80)}%`,
    "--zc-highlight-offset": `${clamp(bandOffset, -50, 80)}%`,
    "--zc-highlight-angle": `${clamp(bandAngle, -30, 30)}deg`,
    "--zc-highlight-radius": `${clamp(bandRadius, 0, 999)}px`,
    "--zc-duration": `${Math.max(duration, 0.01)}s`,
    "--zc-delay": `${Math.max(delay, 0)}s`,
    ...style,
  };

  return createElement(
    as,
    {
      className: ["zc-highlight-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
      style: highlightStyle,
      "data-direction": direction,
      "aria-label": ariaLabel,
    },
    children,
  );
}
