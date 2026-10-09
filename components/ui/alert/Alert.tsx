import type { HTMLAttributes } from "react";
export type AlertProps = HTMLAttributes<HTMLDivElement> & { heading?: string; description?: string; tone?: "info" | "success" | "warning" | "danger" };
export function Alert({ heading = "设置已保存", description = "可以继续编辑，所有改动已保留。", tone = "info", className = "", ...props }: AlertProps) {
  return <div {...props} className={`zc-alert zc-alert--${tone} ${className}`}><span className="zc-alert-symbol" aria-hidden="true">{tone === "success" ? "✓" : tone === "danger" ? "!" : "i"}</span><div><strong>{heading}</strong><p>{description}</p></div></div>;
}
