import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function GlassSegmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const n = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      className={cn("glass-track relative grid rounded-full p-1", className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {/* Sliding glass knob */}
      <span
        aria-hidden="true"
        className={cn("glass-knob pointer-events-none absolute rounded-full", pressed && "is-pressed")}
        style={{
          top: 4,
          bottom: 4,
          left: 4,
          width: `calc((100% - 8px) / ${n})`,
          transform: `translateX(${activeIndex * 100}%) scale(${pressed ? 1.06 : 1})`,
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative z-10 rounded-full px-3 py-1.5 text-center text-sm font-medium transition-colors",
            value === opt.value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
