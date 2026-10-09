import type { HTMLAttributes } from "react";
export type CardProps = HTMLAttributes<HTMLDivElement> & { heading?: string; description?: string; elevated?: boolean };
export function Card({ heading = "项目空间", description = "把下一次灵感留在这里。", elevated = false, children, className = "", ...props }: CardProps) {
  return <div {...props} className={`zc-card ${elevated ? "zc-card--elevated" : ""} ${className}`}><h3>{heading}</h3><p>{description}</p>{children}</div>;
}
