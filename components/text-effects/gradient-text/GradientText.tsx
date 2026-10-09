import { createElement, type CSSProperties, type ElementType } from "react";

export type GradientTextProps = {
  children: string;
  as?: ElementType;
  colors?: [string, string, string];
  angle?: number;
  spread?: number;
  direction?: "forward" | "reverse";
  duration?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
};

type GradientStyle = CSSProperties & Record<`--zc-gradient-${string}`, string>;

export const gradientTextDefaults = {
  colors: ["#ff3f7f", "#7c5cff", "#2dddc2"] as [string, string, string],
  angle: 90,
  spread: 260,
  direction: "forward" as const,
};

export function GradientText({ children, as = "span", colors = gradientTextDefaults.colors, angle = 90, spread = 260, direction = "forward", duration = 2.4, paused = false, className = "", style }: GradientTextProps) {
  const variables: GradientStyle = {
    "--zc-gradient-a": colors[0],
    "--zc-gradient-b": colors[1],
    "--zc-gradient-c": colors[2],
    "--zc-gradient-angle": `${Math.min(360, Math.max(0, angle))}deg`,
    "--zc-gradient-spread": `${Math.min(500, Math.max(120, spread))}%`,
    "--zc-gradient-duration": `${Math.max(.1, duration)}s`,
    ...style,
  };

  return createElement(as, {
    className: ["zc-gradient-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    style: variables,
    "data-direction": direction,
  }, children);
}
