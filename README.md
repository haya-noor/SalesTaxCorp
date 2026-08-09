# SalesTaxCorp Portal

Version 1 is a secure client portal foundation built with Next.js, Supabase Auth/PostgreSQL, and Netlify.

## Included

- Client self-signup with `pending` approval status
- One login page with admin/client routing
- Admin management for clients, stores, and pending accounts
- Client access to every active store belonging to the approved company
- Protected admin and client routes
- PostgreSQL Row Level Security
- Empty Reports area ready for Version 1B

## Local setup

1. Install Node.js 22 and dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and enter the development Supabase URL and keys.

3. In the Supabase SQL Editor, run:

   ```text
   supabase/migrations/202608080001_initial_portal.sql
   ```

4. In **Authentication → Providers → Email**, disable email confirmation for this development-only no-email flow.

5. Bootstrap the first administrator from PowerShell:

   ```powershell
   $env:ADMIN_EMAIL="admin-test@example.com"
   $env:ADMIN_PASSWORD="choose-a-strong-test-password"
   $env:ADMIN_FULL_NAME="Test Administrator"
   npm run bootstrap:admin
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

## Test accounts

Create two client users through `/signup`, approve each against a different client company, and test them in separate browser profiles. The email addresses only need to be unique during Version 1 development because email confirmation is disabled.

## Verification

```bash
npx tsc --noEmit
npx eslint src scripts --no-warn-ignored
npm run build
npm run test:smoke
```

## Netlify

The project includes `netlify.toml` and targets Node.js 22. Add these variables in Netlify rather than committing them:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The no-email signup flow is intended only for controlled development/testing. Add verified email and recovery before a real public launch.
