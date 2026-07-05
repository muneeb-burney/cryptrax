import { useState } from "react";
import { cn } from "@/lib/utils";

export function GlassToggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);

  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={typeof label === "string" ? label : undefined}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => onChange(!checked)}
      className={cn(
        "glass-track relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked && "is-on",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("glass-knob absolute top-1 h-5 w-5 rounded-full", pressed && "is-pressed")}
        style={{
          left: 4,
          transform: `translateX(${checked ? 20 : 0}px) scale(${pressed ? 1.12 : 1})`,
        }}
      />
    </button>
  );

  if (!label) return button;

  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
      {button}
      <span className="select-none">{label}</span>
    </label>
  );
}
