import type { HTMLAttributes } from "react";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: "accent" | "success" | "warning" | "danger" };
export function Badge({ tone = "accent", children = "新版本", className = "", ...props }: BadgeProps) {
  return <span {...props} className={`zc-badge zc-badge--${tone} ${className}`}>{children}</span>;
}
