# Syed Sufyan — Portfolio

A React portfolio with a draggable Card Swap project stack, certificate previews and PDF downloads, a document folder, a skills meter, a folding portrait reveal, an animated search panel, an education timeline and a live handwritten contact note. The owner studio manages content and uploads.

## Run locally

```powershell
npm ci
npm run dev
```

Open the address printed by Vite. Owner studio: `/#/syed` (also `/#/studio`). With no service configuration the public portfolio works from its checked-in content, and the studio offers a clearly marked, export-only preview. There are no default credentials. Preview mode cannot publish or upload.

```powershell
npm run build
npm run preview
npm test
npm run lint
```

The old OS application and pre-existing staged changes were preserved. The new entry point is `src/main.jsx`; all redesign code is under `src/portfolio/`. Branch: `codex/portfolio-studio`. No commits or pushes were made.

## Hosting choice

Recommended: **Vercel Hobby + Supabase Free + Gmail App Password**. Connect the repository in Vercel, select this branch, use `npm run build` and output `dist`. The `api/contact.js` Node function sends mail through Gmail SMTP. Formspree is not required.

As checked on 17 November 2026:

- [Vercel Hobby](https://vercel.com/docs/plans/hobby) is free for personal, non-commercial use within its limits. [Vercel supports SMTP except port 25](https://vercel.com/kb/guide/serverless-functions-and-smtp); this app uses Gmail on port 465.
- [Supabase Free](https://supabase.com/pricing) includes 500 MB database and 1 GB file storage. [Low-activity projects may pause after seven days](https://supabase.com/docs/guides/platform/free-project-pausing). Pausing affects editing, uploads and the email rate limiter.
- Gmail App Passwords require [Google 2-Step Verification](https://support.google.com/mail/answer/185833). Gmail has [sending limits](https://support.google.com/mail/answer/22839); a free account is not unlimited transactional mail infrastructure.
- [Render free web services block SMTP ports 25, 465 and 587](https://render.com/docs/free). `render.yaml` supports the static frontend only; it does not host the Gmail function. For the requested all-free Gmail setup, use Vercel. The direct mailto link still works on a static host.

The website falls back to checked-in public content when Supabase is unavailable. This keeps it readable but may show the older snapshot; it does not make paused editing/storage services available. Export content periodically and retain copies of uploaded assets. Cloud edits are stored in Supabase, not written back into GitHub.

## Connect owner editing

1. Create a Supabase project in your own account. Choose Free. In Authentication settings, disable public sign-ups; this site has no public registration flow.
2. Run `supabase/schema.sql` and then `supabase/contact.sql` in the project's SQL editor. It creates content tables, the owner authorization function, optimistic publishing, a public media bucket, and owner-only upload policies. Use a dedicated project so unrelated storage policies cannot accidentally broaden access.
3. Create your email/password user in **Authentication → Users** using the dashboard. Use a strong unique password and confirm the email. Copy that user's UUID.
4. Run the owner enrollment statement shown at the end of the schema, replacing the placeholder UUID. Do not grant access by a client-controlled profile field or email string.
5. Copy `.env.example` to `.env.local`. Fill in the project URL and the project's **anon or publishable key**. These identify the project; RLS protects writes. Never place a service-role key, database password, or owner password in any `VITE_` variable.
6. Add those same two variables to Vercel or Render and rebuild. For local work, restart Vite after changing environment variables.
7. Open `/#/syed`, sign in and publish once to seed the database with the current portfolio. Reload the public page to confirm it reads the published content.

The studio edits profile, projects, skill groups, education, certificates, achievements and additional pages. Add, remove and reorder records. Image/PDF fields support uploads and existing URLs. Images are resized to at most 2000 pixels and re-encoded as WebP to remove metadata. Uploads are limited to 10 MB; SVG and other active document types are not accepted. PDFs and images in this bucket are public, so upload only documents intended for visitors. Images in image-only fields cannot be PDFs.

Sessions stay in memory and do not persist after refreshing the page. Sign in again after refresh. Account password recovery or changes can be managed from Supabase Authentication; the website does not implement a separate reset-email flow. Remove a UUID from `portfolio_owners` to revoke publishing/upload rights. Database checks apply even if someone bypasses the interface.

Publishing is atomic and checks the version you loaded. If another session publishes first, the studio preserves your unsaved draft and asks you to export it before reloading. Replaced uploads receive new paths, keeping earlier links intact. Removing a record does not delete its uploaded asset. Manage unreferenced assets through Supabase Storage after checking references; do not delete metadata with SQL.

## Connect enquiry email with Gmail

1. Enable 2-Step Verification on your Gmail account, then create a Google App Password specifically for this portfolio. Use the App Password, never your normal Gmail password. Do not paste it into chat or commit it.
2. Set these **server-only** environment variables in Vercel:
   - `GMAIL_USER=syedsufyanpersonal@gmail.com`
   - `GMAIL_APP_PASSWORD` — the generated App Password
   - `CONTACT_TO=syedsufyanpersonal@gmail.com`
   - `SITE_URL` — the exact production origin, such as `https://your-project.vercel.app`
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the server-only service-role key, never the public anon key and never prefixed with `VITE_`
3. Confirm `supabase/contact.sql` has been applied. It creates a server-only atomic sending reservation: 3 attempts per IP per 15-minute bucket and 40 total attempts per UTC day. IPs are HMAC-hashed; expired rate-limit rows are removed on subsequent requests. These caps include SMTP failures to prevent repeated abuse. The endpoint fails closed if the limiter is unavailable. Origin validation is additional protection, not proof that a caller is human.
4. Redeploy, send a real test, and check `syedsufyanpersonal@gmail.com`. The server awaits SMTP acceptance before returning success. SMTP acceptance still does not prove inbox delivery; check spam as well.

For local use, the same values can go in ignored `.env.local`, with `SITE_URL=http://127.0.0.1:5173`. Vite's development middleware runs the same server handler. Restart Vite after changing environment variables. No secret variables are injected into the browser. `npm run preview` only previews the static build; test the email function with `npm run dev` or a Vercel deployment.

The message always goes to the configured owner address. Visitor email is Reply-To only; visitors cannot set To, From or the subject. Plain text email, length limits, header-injection validation, fixed destination, request-size limit, same-origin checks, server-side sending caps and non-leaking error messages protect the endpoint. Local checks exercise these paths; your live Gmail/Supabase configuration must still be verified.

Without configuration, the API returns 503 and the form preserves the draft with a direct-email alternative. Sending errors and limits do not trigger the success animation. The letter folds, closes, seals and departs after accepted delivery, and “Write another” resets it. Paused/reduced motion preserves the outcome without the extended animation.

## Content and references

See `docs/DESIGN-AND-CONTENT.md` for source provenance and the interaction choices. The supplied resume and tutor presentation informed the updated profile and projects. The public resume copy omits the street address; the source document was not changed. Project illustrations are original CSS compositions, not screenshots or evidence of production analytics.

Current limitations: provider accounts are not connected in this checkout; live login, storage, email delivery and host headers must be verified after setup. No deployment was performed. Existing project links are content references, not a claim that every external application is currently available. New project screenshots, certificate photos and exact contribution details can be added through the studio.

## Verification

`npm test` runs real PostgreSQL semantics locally via PGlite with simulated Supabase `auth` and `storage` schemas: anonymous write rejection, non-owner rejection, owner publishing, stale-version rejection, malformed payload rejection and folder-scoped upload RLS. This does not certify the live Supabase gateway, Auth configuration, storage service or provider quotas.

Browser checks use Python Playwright (`python -m pip install playwright`, then `python -m playwright install chromium`). With the normal dev server at port 5173:

```powershell
python tests/browser_smoke.py
```

For intercepted provider integration checks only, create ignored `.env.test.local` containing a fictitious project URL `https://portfolio-test.supabase.co`, `VITE_SUPABASE_ANON_KEY=test-public-key`. Run `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort --mode test`, then `python tests/browser_providers.py`. All provider requests and `/api/contact` are intercepted; no Gmail message is sent. Never deploy test mode. Screenshots and results go to ignored `.local/`.

The legacy OS code retains its existing lint warnings. The new portfolio and server files are checked separately from the retained legacy application. Fonts are self-hosted; no external font request is needed. The deployment configurations include CSP and anti-framing headers. If adding another media/API host, review CSP deliberately rather than disabling it.

### GitHub Activity

The homepage reads daily counts from the public contribution calendar for Syed-git-07. The activity endpoint caches successful responses for six hours. To use GitHub GraphQL instead, set the optional server environment variable `GITHUB_ACTIVITY_TOKEN` in the host or shell running the server or build. The visualization displays the contribution counts visible to that credential.

Vite development, Vite preview, and Vercel serve the activity endpoint. Static-only hosts display the dated snapshot refreshed during each production build. When GitHub is unreachable during a build, the bundled public snapshot remains available.
