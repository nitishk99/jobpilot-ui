# JobPilot Frontend

A separate React + TypeScript frontend starter for the existing JobPilot backend. It includes Google sign-in, an applications dashboard, application timelines, original email viewing, an unassigned-email review inbox, and account settings.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- The JobPilot backend running locally (default expected origin: `http://localhost:5000`)

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

On Windows PowerShell, create the environment file with:

```powershell
Copy-Item .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` to the backend origin only, without `/api`, for example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The API client appends `/api` automatically.

## Test, build, and type-check

```bash
npm test
npm run test:coverage
npm run typecheck
npm run build
```

Coverage reports are saved in `coverage/`.

## Features included

- Session restoration through `GET /api/auth/me`
- Google OAuth redirect through `GET /api/auth/google`
- Logout through `POST /api/auth/logout`
- Applications list through `GET /api/applications?page=1&limit=10`
- Application timeline through `GET /api/applications/:id/timeline`
- Original stored email through `GET /api/emails/:id`
- Review inbox through `GET /api/emails/review?page=1&limit=10`
- Manual association through `PATCH /api/emails/:id/associate`
- Create a new application from a review email through `POST /api/emails/:id/create-application`
- Dismissal of an unrelated review email through `DELETE /api/emails/:id/review`

## Project structure

```text
src/
├── main.tsx      # React and query client setup
├── app/          # App component, routes, and session checks
├── api/          # Shared HTTP client and response helpers
├── config/       # Frontend routes
├── components/   # Shared UI and page layouts
├── features/     # Auth, applications, timeline, email review, account
├── hooks/        # Shared React hooks
├── utils/        # Formatting and Gmail link helpers
└── styles/       # Global styles
tests/
├── account/      # Account tests
├── applications/ # Application tests
├── auth/         # Sign-in and session tests
├── emails/       # Email API tests
├── review/       # Review flow tests
├── shared/       # Shared API and routing tests
└── timeline/     # Timeline tests
```
