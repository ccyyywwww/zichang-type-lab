import type { HTMLAttributes } from "react";
export type ThinkingIndicatorProps = HTMLAttributes<HTMLDivElement> & { label?: string; paused?: boolean };
export function ThinkingIndicator({ label = "正在思考…", paused = false, className = "", ...props }: ThinkingIndicatorProps) {
  return <div {...props} role="status" className={`zc-thinking-indicator ${className}`} data-paused={paused}><span className="zc-thinking-indicator-dots" aria-hidden="true"><i /><i /><i /></span><span>{label}</span></div>;
}
