import type { HTMLAttributes, CSSProperties } from "react";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & { value?: number; max?: number; showValue?: boolean };
export function Progress({ value = 68, max = 100, showValue = true, className = "", ...props }: ProgressProps) {
  const total = Number.isFinite(max) && max > 0 ? max : 100;
  const current = Math.min(total, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = Math.round(current / total * 100);
  return <div {...props} className={`zc-progress ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>
    <span className="zc-progress-track"><span className="zc-progress-fill" style={{ width: `${percent}%` } as CSSProperties} /></span>
    {showValue && <span className="zc-progress-value" aria-hidden="true">{percent}%</span>}
  </div>;
}
