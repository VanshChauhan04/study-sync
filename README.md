# StudySync

AI-powered study group finder MVP for hackathon.

## What works in this version

- Search and filter study groups.
- Join or leave groups with live seat-count updates.
- Create a new study group and immediately join it.
- Persist groups, memberships, messages, and plans in PostgreSQL.
- Generate a weekly study plan from exam date, hours/day, subject, weak topic, and joined groups.
- Send live-room chat messages.
- Ask the in-room StudySync AI for contextual help.
- Generate a session summary from the current room messages.
- Watch dashboard metrics update from joined groups, chat contributions, and summaries.

This build uses PostgreSQL + Prisma for persistence, Clerk for auth, and Gemini or OpenAI (optional) for AI answers.

## Run locally

1. Create `.env` based on `.env.example`.
2. Fill in `DATABASE_URL`, Clerk keys, and optionally `GEMINI_API_KEY` or `OPENAI_API_KEY`.

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
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
4. Set environment variables in Vercel (see `.env.example`).
5. Run database migrations (recommended) using `npm run prisma:deploy`.
6. Build command: `npm run build`.
7. Output directory: leave empty/default.
