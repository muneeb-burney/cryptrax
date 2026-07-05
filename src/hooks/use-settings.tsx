import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatCompact as fmtCompact,
  formatPrice as fmtPrice,
  type Currency,
} from "@/lib/format";

export type Theme = "dark" | "darker";

export type Settings = {
  theme: Theme;
  currency: Currency;
  refreshInterval: number; // seconds
};

const DEFAULTS: Settings = {
  theme: "dark",
  currency: "USD",
  refreshInterval: 60,
};

const STORAGE_KEY = "cryptrax.settings";

type SettingsContextValue = Settings & {
  setTheme: (t: Theme) => void;
  setCurrency: (c: Currency) => void;
  setRefreshInterval: (s: number) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStored(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme === "darker" ? "darker" : "dark",
      currency: parsed.currency === "PKR" ? "PKR" : "USD",
      refreshInterval:
        typeof parsed.refreshInterval === "number" && parsed.refreshInterval > 0
          ? parsed.refreshInterval
          : DEFAULTS.refreshInterval,
    };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Start from defaults so the first client render matches the server markup,
  // then hydrate from localStorage after mount to avoid hydration mismatches.
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    setSettings(readStored());
  }, []);

  // Persist + reflect theme onto <html>.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    root.classList.toggle("theme-darker", settings.theme === "darker");
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setCurrency: (currency) => setSettings((s) => ({ ...s, currency })),
      setRefreshInterval: (refreshInterval) =>
        setSettings((s) => ({ ...s, refreshInterval })),
      reset: () => setSettings(DEFAULTS),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

/** Currency-aware money formatters bound to the user's selected display currency. */
export function useMoney() {
  const { currency } = useSettings();
  const price = useCallback((v: number) => fmtPrice(v, currency), [currency]);
  const compact = useCallback((v: number) => fmtCompact(v, currency), [currency]);
  return { price, compact, currency };
}
