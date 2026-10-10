# Gullak — Repository Instructions

Gullak is a hackathon MVP for Megathon X / Vanguard Community Stewardship.

Before making product, UX, architecture, or implementation decisions:

1. Read `CLAUDE.md` completely.
2. Treat `CLAUDE.md` as the detailed source of truth for product scope, learning model, UX, visual design, technical decisions, P0/P1/P2 priorities, and non-goals.
3. Inspect the existing implementation before changing architecture or dependencies.

## Core product loop

DIAGNOSE → RECOMMEND → LEARN → PRACTISE → APPLY → REFLECT → UPDATE MASTERY → ADAPT

Every meaningful learner decision can become evidence. That evidence should be capable of changing the learner's next recommendation.

## Engineering priorities

- Mobile-first responsive experience
- React + Vite unless the existing repository already uses another agreed stack; this repository uses Next.js, so retain it
- Tailwind CSS where already configured / appropriate
- React Router for a Vite application; retain Next.js App Router here
- Local-first prototype state
- Data-driven learning/scenario content
- Reusable components
- Business and learning logic separated from UI
- Transparent deterministic adaptation rather than unnecessary ML
- Polished core journey over feature quantity

## Do not add unless explicitly requested

- Authentication or backend/database
- Real bank account integration or Account Aggregator
- Real-money functionality, stock trading, or paper portfolio
- Live market APIs or AI tutor/chatbot
- NGO analytics backend or native mobile wrapper
- Unnecessary enterprise architecture
- Redux unless already required by the existing project

## Quality

Before finishing meaningful implementation work:

- Run lint if configured
- Run tests if configured
- Run the production build
- Fix errors introduced by the change
- Verify mobile and desktop behaviour

Never silently expand or replace the agreed MVP.
