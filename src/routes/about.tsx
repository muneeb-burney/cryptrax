import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LineChart,
  Search,
  Star,
  Bell,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & How It Works — Cryptrax" },
      {
        name: "description",
        content:
          "Cryptrax is a clean, real-time cryptocurrency tracker. Learn how it works — live prices, candlestick charts, and a personal watchlist in a glassmorphism dashboard.",
      },
      { property: "og:title", content: "About & How It Works — Cryptrax" },
      {
        property: "og:description",
        content:
          "How Cryptrax tracks the crypto market in real time: live prices, candlestick charts, and a personal watchlist.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const STEPS = [
  {
    icon: Search,
    title: "Browse the market",
    body: "Explore the top cryptocurrencies with live prices, 24-hour movements, market cap, volume, and 7-day trend sparklines. Search and sort to find any coin fast.",
  },
  {
    icon: LineChart,
    title: "Dive into any coin",
    body: "Open a coin for real-time candlestick charts across multiple timeframes, with SMA and EMA indicators you can toggle on and fine-tune.",
  },
  {
    icon: Star,
    title: "Build your watchlist",
    body: "Sign in and star the coins you care about. Your watchlist is saved to your account and available whenever you return.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time data",
    body: "Prices and charts refresh automatically on an interval you control in Settings.",
  },
  {
    icon: Bell,
    title: "Clear signals",
    body: "Gains and losses are colour-coded everywhere, so trends read at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your watchlist is tied to your account with secure authentication — nothing is shared.",
  },
  {
    icon: Globe,
    title: "Flexible display",
    body: "Switch display currency and theme depth to match how you like to read the market.",
  },
];

function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-10">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          About Cryptrax
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          A clearer window into the crypto market
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cryptrax is a real-time cryptocurrency tracker built around clarity. Live prices,
          candlestick charts, and a personal watchlist come together in a calm, glassmorphism
          dashboard — no noise, no clutter, just the signal.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="glass lift-hover rounded-3xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20">
                  <step.icon className="h-5 w-5 text-accent" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">What you get</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-3xl p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/15">
                  <f.icon className="h-4.5 w-4.5 text-accent" />
                </span>
                <h3 className="font-semibold">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass rounded-3xl p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold">Ready to explore?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Jump into the live market, or head to settings to make the dashboard your own.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          >
            View the market
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-full border border-glass-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Open settings
          </Link>
        </div>
      </section>
    </main>
  );
}
