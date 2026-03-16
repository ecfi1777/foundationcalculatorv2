# Total Foundation Calculator V2

Cloud-based foundation takeoff tool for concrete contractors.

## Tech Stack

- React + Vite + TypeScript
- Supabase (auth, database, edge functions)
- Stripe (billing)
- Tailwind CSS + shadcn/ui
- Lovable Cloud

## Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Copy environment variables and fill in values
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for required variables:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID
- `STRIPE_PRICE_ID` — Stripe price ID for subscription checkout
