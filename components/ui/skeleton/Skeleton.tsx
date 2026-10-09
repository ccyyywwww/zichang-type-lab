import type { HTMLAttributes } from "react";
export type SkeletonProps = HTMLAttributes<HTMLDivElement> & { lines?: number; paused?: boolean; label?: string };
export function Skeleton({ lines = 3, paused = false, label = "内容加载中", className = "", ...props }: SkeletonProps) {
  const count = Number.isFinite(lines) ? Math.max(1, Math.min(8, Math.round(lines))) : 3;
  return <div {...props} role="status" aria-label={label} className={`zc-skeleton ${className}`} data-paused={paused}>{Array.from({ length: count }, (_, index) => <span key={index} className="zc-skeleton-line" aria-hidden="true" />)}</div>;
}
