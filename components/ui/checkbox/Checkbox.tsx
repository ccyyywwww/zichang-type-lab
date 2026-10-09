import type { InputHTMLAttributes } from "react";
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;
export function Checkbox({ className = "", ...props }: CheckboxProps) {
  return <input {...props} type="checkbox" className={`zc-checkbox ${className}`} />;
}
