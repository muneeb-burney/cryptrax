import { useState } from "react";
import { cn } from "@/lib/utils";

export function GlassSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  displayValue,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: React.ReactNode;
  displayValue?: React.ReactNode;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {(label || displayValue !== undefined) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">{label}</span>
          <span className="tabular-nums text-foreground">{displayValue ?? value}</span>
        </div>
      )}
      <div className="glass-track relative flex h-8 items-center rounded-full px-1">
        {/* Faint active fill */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1 top-1 bottom-1 rounded-full bg-white/8"
          style={{ width: `calc(${pct}% )`, maxWidth: "calc(100% - 8px)" }}
        />
        {/* Glass thumb */}
        <span
          aria-hidden="true"
          className={cn("glass-knob pointer-events-none absolute top-1/2 h-6 w-6 rounded-full", pressed && "is-pressed")}
          style={{
            left: `calc(${pct}% * (100% - 24px) / 100% + 4px)`,
            transform: `translate(-2px, -50%) scale(${pressed ? 1.14 : 1})`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
        />
      </div>
    </div>
  );
}
