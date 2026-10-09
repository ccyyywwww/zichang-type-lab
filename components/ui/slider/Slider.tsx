import type { InputHTMLAttributes } from "react";
export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;
export function Slider({ className = "", min = 0, max = 100, step = 1, ...props }: SliderProps) {
  return <input {...props} type="range" min={min} max={max} step={step} className={`zc-slider ${className}`} />;
}
