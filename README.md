# Trainonex Solutions

Portfolio site and studio admin for Trainonex. The public site reads published case studies from the API. Drafts stay private. Editors manage projects, categories, and contact messages without changing source code.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios, Lucide
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Auth: bcrypt password hashes, JWT in an httpOnly cookie and a bearer token
- Images: Cloudinary in production, local `server/uploads` when Cloudinary is not configured

## Project structure

```
client/     React portfolio and studio UI
server/     REST API, models, auth, uploads
docs/API.md Endpoint reference
```

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas cluster
- A Cloudinary account for durable images on Render

## Local setup

From the repository root:

```bash
npm run install:all
```

Create the API environment file:

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env

# macOS or Linux
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI` — local MongoDB or the Atlas connection string
- `JWT_SECRET` — at least 32 random characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — used only to create the first admin account
- Cloudinary keys if you want hosted images

Optional client override:

```bash
Copy-Item client/.env.example client/.env
```

`VITE_API_URL` defaults to `http://localhost:5000` when it is unset.

Start both apps:

```bash
npm run dev
```

- Site: http://localhost:5173
- API: http://localhost:5000/api/health
- Studio login: http://localhost:5173/admin/login

The API creates the admin account and four default categories on startup when the database is empty. It does not overwrite an existing admin. To set a new password for the email in `ADMIN_EMAIL`:

```bash
npm run seed -- --reset-password
```

Run that from the repository root. The password is read from `server/.env` and is never printed.

`npm run smoke --prefix server` runs the API against a disposable `trainonex_smoke` database and checks auth, draft privacy, publishing, edits, contact storage, and deletion. Local MongoDB must be running. It does not touch the `trainonex` database.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API and Vite together |
| `npm run build` | Compile the API and build the client |
| `npm run seed` | Create missing categories and the first admin |
| `npm start` | Run the compiled API |

## Security notes

- Passwords are hashed with bcrypt (12 rounds) and are not returned by the API.
- Admin routes require a valid JWT and the `admin` role.
- Login is rate limited. Contact submissions are rate limited.
- Mutating requests must send `X-Requested-With: XMLHttpRequest`, which blocks simple cross-site form posts.
- Request keys that look like MongoDB operators are stripped.
- Uploads allow JPEG, PNG, WebP, and GIF only, at 5MB each, and the file signature is checked.
- Helmet sets security headers. CORS allows only `CLIENT_URL`.
- Do not commit `.env` files or real credentials.

The browser stores the JWT so the studio session survives a refresh when the site and API are on different hosts (Vercel and Render). The API also sets an httpOnly cookie. Neither value belongs in source code.

## Deployment

### MongoDB Atlas

1. Create a cluster and a database user.
2. Allow the Render service to connect (IP allow list).
3. Copy the connection string into `MONGODB_URI`.

### Cloudinary

1. Create a cloud and an API key.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the API.
3. Leave them empty locally if you want files stored in `server/uploads`.

Render’s disk is ephemeral. Production image hosting needs Cloudinary, or uploads disappear on restart.

### API on Render

`render.yaml` describes the web service. In the Render dashboard you can also set:

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

Set `NODE_ENV=production`, `CLIENT_URL` to the Vercel origin (no trailing slash), and `SERVER_URL` to the Render origin. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first boot so the admin account is created. Change the password after the first login by updating the env var and running the reset command against that environment, or replace the admin document.

Cookies in production use `SameSite=None; Secure` so the Vercel origin can send them. The client also sends the bearer token.

### Site on Vercel

- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output: `dist`
- Environment: `VITE_API_URL` = the Render URL, no trailing slash

`client/vercel.json` rewrites unknown paths to `index.html` so project and studio routes work on refresh.

## Managing the portfolio

1. Sign in at `/admin/login`.
2. Add or rename categories.
3. Create a project. A thumbnail is required before it can be published.
4. Save as a draft to keep it off the public site, or publish it.
5. The public work section and `/work/:slug` read only published projects.
6. Unpublish or delete a project and it leaves the public site on the next fetch.
7. Contact form submissions are stored and listed under Messages.

No source change is required to add, edit, or remove case studies.
