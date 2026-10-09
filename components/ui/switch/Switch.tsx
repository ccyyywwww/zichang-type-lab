import type { InputHTMLAttributes } from "react";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;
export function Switch({ className = "", ...props }: SwitchProps) {
  return <input {...props} type="checkbox" role="switch" className={`zc-switch ${className}`} />;
}
