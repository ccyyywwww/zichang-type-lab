import type { HTMLAttributes } from "react";
export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & { label?: string; paused?: boolean };
export function Spinner({ label = "加载中", paused = false, className = "", ...props }: SpinnerProps) {
  return <span {...props} role="status" className={`zc-spinner ${className}`} data-paused={paused}><span className="zc-spinner-ring" aria-hidden="true" /><span>{label}</span></span>;
}
