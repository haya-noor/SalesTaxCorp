# SalesTaxCorp Portal

Sales Tax Corp is a public marketing website and secure client portal built with Next.js, Supabase Auth/PostgreSQL, and Netlify.

## Included

- Public homepage with services, process, resources, and consultation calls to action
- Interactive public pricing estimator and FAQ
- Public contact/consultation information page
- Client self-signup with `pending` approval status
- One login page with admin/client routing
- Admin management for clients, stores, and pending accounts
- Admin-only promotion of a verified pending signup to administrator
- Self-service password changes for active administrators and client users
- Client access to every active store belonging to the approved company
- Protected admin and client routes
- PostgreSQL Row Level Security
- Empty Reports area ready for Version 1B

The values shown by the pricing estimator are temporary planning figures. Update them in `src/features/pricing/config.ts` when approved pricing changes; no component edits or database migration are required.

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

4. In **Authentication → Providers → Email**:

   - Disable email confirmation for this development-only no-email flow.
   - Enable **Require current password when changing password**.

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

The portal has two fixed administrators: Manzoor and Izaz. Administrators
cannot create or promote additional administrators through the website. Public
signup always creates a pending client account and never accepts a requested
role. The deployment-only bootstrap command is reserved for provisioning those
fixed administrator accounts in a new environment.

Both roles use the same `/login` page, labeled **Portal Login** on the public
website. Supabase Auth verifies the credentials, and the application profile
then routes an active administrator to `/admin` or an approved client user to
`/dashboard`. The public `/signup` page is client-only; there is no public
administrator signup page.

Administrators created with `npm run bootstrap:admin` should receive a strong
temporary password and change it immediately from **My account** after their
first login.

Active users change their own password from **Account**. The server verifies
the current password, Supabase Auth stores the new password securely, and all
existing sessions are signed out after a successful change. Passwords are never
stored in the application tables.

## Verification

```bash
npx tsc --noEmit
npx eslint src scripts --no-warn-ignored
npm run build
npm run test:smoke
```

Public route checks should confirm that `/`, `/pricing`, `/contact`, `/login`, and `/signup` return successfully while anonymous requests to `/admin` and `/dashboard` redirect to `/login`.

## Netlify

The project includes `netlify.toml` and targets Node.js 22. Add these variables in Netlify rather than committing them:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The no-email signup flow is intended only for controlled development/testing. Add verified email and recovery before a real public launch.
