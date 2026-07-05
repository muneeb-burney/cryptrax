import { createFileRoute } from "@tanstack/react-router";
import { Moon, Coins, Timer, RotateCcw } from "lucide-react";
import { GlassSegmented } from "@/components/glass/GlassSegmented";
import { GlassSlider } from "@/components/glass/GlassSlider";
import { useSettings, type Theme } from "@/hooks/use-settings";
import type { Currency } from "@/lib/format";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cryptrax" },
      {
        name: "description",
        content:
          "Personalize Cryptrax: switch between dark and darker themes, choose your display currency, and control how often live prices refresh.",
      },
      { property: "og:title", content: "Settings — Cryptrax" },
      {
        property: "og:description",
        content: "Theme, display currency, and live-refresh preferences for Cryptrax.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    theme,
    currency,
    refreshInterval,
    setTheme,
    setCurrency,
    setRefreshInterval,
    reset,
  } = useSettings();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Tune the look and behaviour of your dashboard. Preferences are saved on this device.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <SettingRow
          icon={<Moon className="h-5 w-5 text-accent" />}
          title="Theme"
          description="Choose how deep the midnight background goes."
        >
          <GlassSegmented<Theme>
            value={theme}
            onChange={setTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "darker", label: "Darker" },
            ]}
          />
        </SettingRow>

        <SettingRow
          icon={<Coins className="h-5 w-5 text-accent" />}
          title="Display currency"
          description="Prices and totals are shown in this currency (approximate FX)."
        >
          <GlassSegmented<Currency>
            value={currency}
            onChange={setCurrency}
            options={[
              { value: "USD", label: "USD $" },
              { value: "PKR", label: "PKR ₨" },
            ]}
          />
        </SettingRow>

        <SettingRow
          icon={<Timer className="h-5 w-5 text-accent" />}
          title="Refresh interval"
          description="How often live prices update in the background."
        >
          <GlassSlider
            className="min-w-[16rem]"
            value={refreshInterval}
            min={10}
            max={300}
            step={5}
            displayValue={`${refreshInterval}s`}
            onChange={setRefreshInterval}
          />
        </SettingRow>

        <div className="pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </button>
        </div>
      </div>
    </main>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/15">
            {icon}
          </span>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="sm:shrink-0">{children}</div>
      </div>
    </section>
  );
}
