import type { CSSProperties, ElementType } from "react";

export type HighlightDirection = "left" | "right" | "center";

export type HighlightTextOptions = {
  bandColor: string;
  bandThickness: number;
  bandStart: number;
  bandEnd: number;
  bandOffset: number;
  bandAngle: number;
  bandRadius: number;
  direction: HighlightDirection;
};

export type HighlightTextProps = Partial<HighlightTextOptions> & {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  delay?: number;
  paused?: boolean;
  style?: CSSProperties;
  "aria-label"?: string;
};

export type HighlightTextStyle = CSSProperties & {
  "--zc-highlight-color": string;
  "--zc-highlight-thickness": string;
  "--zc-highlight-start": string;
  "--zc-highlight-end": string;
  "--zc-highlight-offset": string;
  "--zc-highlight-angle": string;
  "--zc-highlight-radius": string;
  "--zc-duration": string;
  "--zc-delay": string;
};
