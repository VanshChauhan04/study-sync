# StudySync

AI-powered study group finder MVP for hackathon.

## What works in this version

- Search and filter study groups.
- Join or leave groups with live seat-count updates.
- Create a new study group and immediately join it.
- Persist demo state in the browser with `localStorage`.
- Generate a weekly study plan from exam date, hours/day, subject, weak topic, and joined groups.
- Send live-room chat messages.
- Ask the in-room StudySync AI for contextual help.
- Generate a session summary from the current room messages.
- Watch dashboard metrics update from joined groups, chat contributions, and summaries.

This is intentionally Vercel-friendly and does not require a database for the first demo. For true multi-user persistence across devices, add Supabase, Vercel Postgres, Neon, or another hosted database and replace the local demo storage.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js settings.
4. Build command: `npm run build`.
5. Output directory: leave empty/default.

No environment variables are required for this browser-persistent demo build.
