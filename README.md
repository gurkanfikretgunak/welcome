<div align="center"><h1>MasterFabric Welcome</h1>
<p>Developer onboarding portal built with Next.js and Supabase</p></div>

## Overview

This app streamlines onboarding and internal ops:

- GitHub login and profile setup
- Company email verification (OTP)
- Dynamic onboarding checklist and worklogs
- Events (owner management, public registration, tickets)
- Support tickets and settings

## App Routes

- `/` Home
- `/events` Public events list
- `/events/owner` Owner dashboard for events
- `/eventview/[id]` Event details (public)
- `/ticketview/[reference]` Ticket view (public)
- `/tickets` User tickets
- `/profile` User profile
- `/bio` Basic info form
- `/email` Company email verification
- `/worklog` Worklog entry
- `/settings` User settings

API endpoints (App Router):

- `api/send-verification-code`, `api/verify-email-code`
- `api/worklogs`, `api/worklogs/[id]`
- `api/version`, `api/welcome-text`, `api/process-overview`

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Supabase (database + auth + RLS)
- Tailwind CSS
- Sentry for error monitoring

## Scripts

```bash
# local development
npm run dev

# production build
npm run build && npm start

# lint and type-check
npm run lint
npm run type-check
```

## Getting Started

```bash
npm install
cp env.example .env.local
# Fill .env.local with your Supabase + GitHub OAuth credentials
npm run dev
```

Required envs (see `env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 - `RESEND_API_KEY`
 - `RESEND_FROM` (default: `no-reply@masterfabric.co`)
 - `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000`)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- (optional) Sentry if you enable monitoring:
-   - `NEXT_PUBLIC_SENTRY_DSN`
-   - `SENTRY_AUTH_TOKEN`
-   - `SENTRY_ORG`
-   - `SENTRY_PROJECT`
- reCAPTCHA (optional):
-   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
-   - `RECAPTCHA_SECRET_KEY`

## Database

Apply SQL in Supabase (in this order as needed):

## Development Notes

- Error boundaries: `src/app/error.tsx`, `src/app/global-error.tsx`
- Supabase helpers and data access: `src/lib/supabase.ts`
- Sentry helpers: `src/lib/sentry.ts`
- UI components: `src/components/*`

### Monitoring (Sentry)

Sentry is integrated for error tracking and source maps.

1. Set env vars (see above).
2. Build will automatically upload source maps during `npm run build`.
3. Error boundaries will report exceptions to Sentry.

Note: Next.js may deprecate `sentry.client.config.ts` under Turbopack; this repo includes client/server config files and `instrumentation.ts`.

## Contributing

Issues and PRs are welcome. Please run `npm run lint` and `npm run type-check` before submitting.

## License

Licensed under GNU AGPLv3 with Additional Terms. See `LICENSE` for the full text.

- Repository: https://github.com/masterfabric/welcome
- Organization website: https://masterfabric.co
- Contact: license@masterfabric.co

Next.js + Supabase notice (courtesy):
- If you deploy this software or derivatives as a Next.js project using Supabase, please email a short notice to `license@masterfabric.co` with:
  - Repository URL or product link
  - Deploy target (e.g., production, internal)
  - Maintainer contact

Web projects meta requirement:
- Include a MasterFabric-provided license code as a meta tag in your main HTML (e.g., `index.html`):
  - <meta name="masterfabric-license" content="<your-license-code>" />
  - Request a code via `license@masterfabric.co`


Built for MasterFabric development team.