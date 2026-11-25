# Trainonex API

Base URL: `http://localhost:5000` in development, or the Render origin in production.

Responses use this shape:

```json
{ "success": true, "message": "Optional", "data": {} }
```

Errors:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields.",
  "errors": [{ "field": "title", "message": "Title must be between 3 and 120 characters." }]
}
```

Mutating requests must include `X-Requested-With: XMLHttpRequest`. Authenticated requests send `Authorization: Bearer <token>` or the httpOnly `token` cookie. List endpoints accept `page` and `limit` (limit max 50).

`Cache-Control` is not set to cache API JSON. Public project lists only include `status: "published"`.

## Health

`GET /api/health`

```json
{ "success": true, "data": { "status": "ok" } }
```

## Authentication

### `POST /api/auth/login`

Body: `{ "email", "password" }`

`200` returns the admin profile and a JWT. Also sets an httpOnly cookie.

`401` for a wrong email or password. The message does not say which one failed.

`422` when the email or password field is empty or the email is invalid.

`429` after 10 attempts in 15 minutes from the same IP.

### `POST /api/auth/logout`

Clears the auth cookie. `200`.

### `GET /api/auth/me`

Requires an admin session. Returns `{ id, name, email, role }`.

## Public content

### `GET /api/projects`

Query: `page`, `limit`, `category` (category slug).

Returns published projects only, newest first, with the category populated (`name`, `slug`).

### `GET /api/projects/:slug`

One published project. `404` when the slug is missing or the project is still a draft.

### `GET /api/categories`

All categories, sorted by name.

### `POST /api/contact`

Body:

| Field | Rules |
| --- | --- |
| name | 2–80 characters |
| email | valid email |
| company | optional, max 120 |
| budget | optional: `Under $10k`, `$10k–$25k`, `$25k–$50k`, `$50k+`, `Not sure yet` |
| message | 10–5000 characters |
| website | honeypot. When filled, the API pretends the message was saved and stores nothing |

`201` on success. `429` after 5 submissions an hour from one IP.

## Studio

All `/api/admin/*` routes require an authenticated admin. Anyone else receives `401` or `403`.

### `GET /api/admin/stats`

Counts for total, published, and draft projects, category count, unread messages, and the five most recently updated projects.

### Projects

`GET /api/admin/projects` — every project. Query: `page`, `limit`, `status` (`draft` or `published`), `search`.

`GET /api/admin/projects/:id`

`POST /api/admin/projects` — `multipart/form-data`

`PUT /api/admin/projects/:id` — `multipart/form-data`

`PATCH /api/admin/projects/:id/status` — JSON `{ "status": "draft" | "published" }`

`DELETE /api/admin/projects/:id` — deletes the project and its stored images

Multipart fields:

| Field | Rules |
| --- | --- |
| title | 3–120 characters |
| slug | optional. Lowercase letters, numbers, hyphens. Generated from the title when omitted. Must be unique |
| shortDescription | 10–300 characters |
| description | 20–20000 characters |
| category | category id |
| technologies | JSON array or comma-separated string. Up to 12 names |
| projectUrl | optional http(s) URL |
| githubUrl | optional http(s) URL |
| status | `draft` or `published` |
| thumbnail | one image. Required in order to publish |
| gallery | up to 8 images |
| keepGallery | on update, JSON array of `publicId` values to retain |
| removeThumbnail | `true` to clear the current thumbnail when no new file is sent |

Images must be JPEG, PNG, WebP, or GIF, 5MB or smaller. The server checks the file signature, not only the browser-provided type.

Publishing without a thumbnail returns `422`.

### Categories

`GET /api/admin/categories` — includes `projectCount`.

`POST /api/admin/categories` — `{ "name", "slug?" }`

`PUT /api/admin/categories/:id` — `{ "name", "slug?" }`

`DELETE /api/admin/categories/:id` — `409` when any project still uses the category.

Names are unique regardless of letter case.

### Messages

`GET /api/admin/messages` — newest first, paginated.

`PATCH /api/admin/messages/:id/read` — marks a message read.

`DELETE /api/admin/messages/:id`

## Models

**Admin:** `name`, `email` (unique), `password` (hashed, never selected by default), `role` (`admin`), timestamps.

**Category:** `name` (unique), `slug` (unique), timestamps.

**Project:** `title`, `slug` (unique), `shortDescription`, `description`, `thumbnail` `{ url, publicId }`, `gallery` (same shape), `category`, `technologies`, `projectUrl`, `githubUrl`, `status`, timestamps. Indexes: unique slug, status + createdAt, category.

**Contact message:** `name`, `email`, `company`, `budget`, `message`, `read`, timestamps.

## Status codes

| Code | When |
| --- | --- |
| 200 | Read or update succeeded |
| 201 | Created |
| 400 | Bad upload or malformed gallery list |
| 401 | Missing or expired session |
| 403 | Not an admin, or the request header check failed |
| 404 | Record not found, including unpublished public slugs |
| 409 | Duplicate slug, name, or email, or a category that still has projects |
| 413 | JSON body too large |
| 422 | Validation failed |
| 429 | Rate limit |
| 500 | Unexpected server error |
| 502 | Cloudinary rejected an upload |
