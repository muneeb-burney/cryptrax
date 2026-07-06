# Cryptrax

A crypto market tracking web app with a glassmorphism  UI, live price data, and personalized watchlists.

**Live demo:** [cryptrax-muneeb.vercel.app](https://cryptrax-muneeb.vercel.app)

---

## Overview

Cryptrax lets users track live cryptocurrency prices, view candlestick charts, and build a personal watchlist. Built as a self-directed project to explore full-stack app development using AI-assisted tools, from UI design through deployment.

## Features

- **Live market dashboard** — top cryptocurrencies by market cap, price, 24h change, and volume
- **Search & sort** — filter coins by name/symbol, sort by market cap, price, or % change
- **Coin detail pages** — candlestick price charts
- **User authentication** — email/password sign up, login, and logout
- **Personal watchlist** — logged-in users can save/remove coins, persisted per account
- **iOS-style glassmorphism UI** — frosted glass cards, backdrop blur, dark gradient theme

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS |
| Backend / Database | Supabase (Auth, Postgres, Edge Functions) |
| Market Data | CoinMarketCap API |
| App Builder | Lovable |
| Hosting | Vercel |
| Version Control | GitHub |

## Architecture

- The frontend (React/Vite) is deployed on **Vercel**, connected via GitHub for continuous deployment.
- **Supabase** handles user authentication and stores watchlist data in a Postgres table, secured with Row Level Security so each user can only access their own data.
- A **Supabase Edge Function** fetches live data from the CoinMarketCap API server-side, keeping the API key private and out of the browser bundle.

## Environment Variables

| Variable | Purpose | Exposed to browser? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes |
| `COINMARKETCAP_API_KEY` | CoinMarketCap API access | No (server-side only) |

## Getting Started (Local Development)

```bash
# clone the repo
git clone https://github.com/muneeb-burney/cryptrax.git
cd cryptrax

# install dependencies
npm install

# add environment variables
# create a .env file with the variables listed above

# run the dev server
npm run dev
```

## Deployment

The app is deployed on Vercel with continuous deployment from the `main` branch on GitHub. Any changes made in Lovable automatically sync to GitHub and trigger a new deployment.

## Roadmap

- [ ] Drawing tools on charts (trend lines, rectangles, order blocks)
- [ ] Technical indicators (MA, RSI, MACD, Bollinger Bands)
- [ ] Custom domain
- [ ] Price alerts

## Author

**Muneeb Burney**
BSSE Student, Lahore Garrison University
