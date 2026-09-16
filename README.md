# Hamza Rehman — Portfolio & Studio

A responsive React portfolio with a connected, server-authenticated content studio.

## Run locally

Requires Node.js 24 and npm. Install with `npm ci`, then run:

```sh
npm run dev
```

Open http://localhost:5173. The development command starts Vite and the content server together. The Admin link in the footer opens `/admin`. The user ID is `admin`; the requested password has been initialized locally as a salted scrypt hash in `.portfolio-data/auth.json`. No plaintext admin password is included in source or browser bundles.

For a fresh installation, set `ADMIN_PASSWORD` in the server environment before its first start. The server consumes it only when no credential file exists. Environment examples are in `.env.example`; these files are not automatically loaded. To use an environment file, run Node with `--env-file=your-private-file`.

## Manage content

- Profile: name, biography, headings, availability, contact details, portrait, résumé, and page metadata.
- Collections: add, edit, delete, and reorder projects, galleries, certificates, skills, services, experience, testimonials, navigation, and social links.
- Website: section visibility and text, navigation, social links, accent color, and the global animation setting.
- Upload PNG, JPEG, WebP images or a PDF résumé (3 MB maximum per file).
- Preview a draft, then **Publish changes** to update the public site. Open visitor sessions refresh on focus or within 60 seconds.
- Inbox: contact form submissions are stored privately. Reply links open your email application; the site does not automatically send email.
- Security: change the password using the current password. This signs out all sessions.
- Export content from Overview or any editor page. Discard draft reloads the published version. Unpublished drafts live only in the current page.

The public interface has five distinct views: Home, Work, About, Expertise, and Contact. Existing #works, #about, #skills, and #contact links remain valid. The former floating portfolio guide and animation-explanation copy have been removed.

## Production

```sh
npm run build
npm start
```

`npm start` serves the production build and API together on port 3001. For public hosting, configure:

```text
NODE_ENV=production
APP_ORIGIN=https://your-real-domain.example
HOST=0.0.0.0
PORT=3001
DATA_DIR=/persistent/path/portfolio
```

Terminate HTTPS at your reverse proxy. Production refuses to start with a non-HTTPS APP_ORIGIN. Use one Node process and a persistent disk. A Dockerfile is included; mount a writable persistent volume at `/data` and configure APP_ORIGIN plus ADMIN_PASSWORD for a new installation.

### Vercel deployment

The Vercel configuration now routes API requests and uploaded files to a Node function. Connect a dedicated **Upstash Redis** database from the Vercel Marketplace and set these **server-only** environment variables for Production:

- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN: from the database integration. Use the writable token; never prefix credentials with VITE_.
- APP_ORIGIN: the exact HTTPS portfolio origin, without a trailing slash.
- ADMIN_PASSWORD: a unique password of at least 12 characters, used only to initialize an empty store. Change it from Settings after signing in. Existing stored credentials are never reset by deployments.
- PORTFOLIO_STORAGE_PREFIX: optional isolated namespace, default portfolio. Use a separate database or prefix for preview deployments.

Use a durable database with eviction disabled and backups enabled. Content, salted password hashes, sessions, rate limits, inbox messages, and uploaded file bytes persist in Redis across function instances and deployments. For this personal portfolio, uploads are capped at 3 MB to fit Vercel's function payload limit after base64 encoding. This avoids requiring a second storage service. Database storage and request quotas still apply; monitor them in the provider dashboard.

Redeploy after adding the environment variables. New visitors receive published content immediately; already-open visible pages refresh within five seconds, and other tabs in the same browser refresh on publication. Hidden tabs refresh when opened again. Use Publish to save a draft, including a replacement résumé under Content → Profile → Résumé.

To preserve existing local edits and uploads, run node scripts/migrate-cloud.mjs with the target database variables set **before** the first deployment initializes it. It only populates an empty namespace and retains the existing hashed admin password. It never prints credentials. Do not upload .portfolio-data as static files.

Live Vercel configuration and deployment have not been verified from this workspace: no project URL or storage credentials were available. Missing storage causes the API to fail closed with a 503; it never silently saves to temporary disk.

References: [Vercel function limits](https://vercel.com/docs/functions/limitations), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

## Data and recovery

The `.portfolio-data` directory (or DATA_DIR) contains:

- `auth.json`: the admin ID, salt, and password hash.
- `content.json`: the published content and revision.
- `content.backup.json`: the previous published revision.
- `messages.json`: private contact submissions.
- `uploads/`: media referenced by published content.

Back up the entire directory, including uploads. Copy it to migrate hosts. The app never serves this directory directly; only validated upload paths are public. Removing an item from the editor does not delete its uploaded file, so older backups remain usable. To restore a revision, stop the service, back up the current content file, replace it with a validated backup, then restart. Keep this directory out of Git and static hosting uploads.

## Security and performance

Salted scrypt password hashes, constant-time verification, random opaque sessions, HttpOnly/SameSite cookies, Secure cookies in production, 30-minute idle and 8-hour absolute expiration, origin and CSRF checks on mutations, rate limits, server-side schema and URL validation, restrictive security headers, and atomic content writes with revision conflicts. Local Node mode keeps sessions and rate limits in memory. Vercel mode shares them in Redis; each session is bound to the current password hash, so changing the password invalidates sessions on every instance. This is an implemented and tested baseline, not a guarantee against every attack.

Motion uses native scrolling, IntersectionObserver reveals, magnetic links, project tilt, page entrances, an interactive service illustration, and interactive particle typography. The small canvas module loads on demand, caps pixel density at 2, and pauses offscreen or in hidden tabs. It responds to pointer movement and changes its composition on click, touch, or keyboard activation. OS reduced-motion preferences, the visitor motion toggle, and the admin animation setting disable ongoing animation. Images below the hero lazy-load; fonts are served locally. The main app and admin are separate bundles.

Security references: [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Node crypto](https://nodejs.org/api/crypto.html).

## Checks

```sh
npm test
npm run build
npm run lint
```

Server tests use temporary isolated data and test authentication, CSRF, rate limits, authorization, schema rejection, uploads, inbox privacy, publishing conflicts, backups, restart persistence, and production cookies. `scripts/visual-check.cjs` exercises browser flows and saves QA screenshots; it accepts PLAYWRIGHT_PATH, CHROME_PATH, and QA_PASSWORD environment variables. The browser workflow restores its test content after publishing.

## September 2026 redesign

Home uses interactive particle typography and oversized headlines; Work is a dark gallery with grid/list views and category filters; About uses orange, an editorial portrait, a timeline, credentials, and testimonials; Expertise uses cobalt with an interactive service index; Contact uses lime and a numbered form. The admin has five main destinations, searchable collections, one open item editor at a time, and grouped profile fields.

Reference research: [Dribbble portfolios](https://dribbble.com/search/bold-portfolio), [GetLayers](https://www.getlayers.ai/), [MotionSites](https://motionsites.ai/), and [Awwwards portfolios](https://www.awwwards.com/websites/portfolio/). The implementation and procedural artwork are original; no paid templates or external models are required.

Validation: `npm run build`, `npm run lint`, and `npm test` (12 passing checks). Browser checks covered project filters and galleries, page navigation, service switching, 390 px mobile rendering, draft preview, publishing, global motion controls, and contact submission in a separate temporary-data instance. `node scripts/qa-preview.mjs` starts that disposable test instance on port 3002; it never uses the real admin credentials or content store.

The pre-redesign source and local content snapshot are in `.redesign-backup/`. This folder is private, excluded from Git, and not included in the production build.

Hero artwork: Website → Hero artwork offers the existing brand mark or an uploaded PNG/JPEG/WebP logo rendered as dots, and text mode with 1–12 slides. Each slide supports 60 characters and up to three lines; text wraps automatically. Reorder slides, edit the optional caption and upper text, preview, then publish. Existing content receives logo mode with captions hidden by default.
