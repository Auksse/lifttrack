# CLAUDE.md — Gym Log App

This file is read automatically by Claude Code at startup. It provides context about
the project and how to work on it effectively.

---

## Project Overview

A personal gym logging web app.

The user is not a professional developer. Explanations should be clear and practical.
Prefer making targeted, surgical changes over large rewrites.

---


## Active Training Program

The user is following a structured 12-week boxing S&C program.
Full program details, exercise list, template definitions, starting loads, and progression
rules are in:

```
BOXING_PROGRAM.md
```

Read that file before doing any work related to exercises, templates, or progression tracking.

### Key things to know about the program

- 3 sessions per week: Session A (Monday), Session B (Wednesday), Session C (Friday)
- 3 templates need to exist: "Boxing A — Power + Lower", "Boxing B — Push + Core", "Boxing C — Pull + Conditioning"
- The exercise library may be missing some exercises — see the checklist in BOXING_PROGRAM.md
- The user has elbow issues — barbell bench press is intentionally excluded from the program. Do not add it back.
- Progression is load-based with specific kg increments, not just RPE. See BOXING_PROGRAM.md for rules.

---

## Priority Task List

When the user asks you to work on the boxing program integration, work through these in order:

1. Verify exercise library against BOXING_PROGRAM.md checklist — add missing exercises
2. Create or validate the 3 session templates using the Template Definitions in BOXING_PROGRAM.md
3. Test the template → workout → history flow end to end
4. Add progression flag logic for the 5 main lifts
5. Optional: deload reminders and phase tracking

---

## Tech Stack

- **Backend:** Python / FastAPI / Uvicorn
- **Frontend:** React / Vite
- **Database:** SQLite (local dev)
- **Version control:** Git (local, pushed to GitHub)

---


## Notes

- The user works on this in github in VS Code with Claude Code
- Always explain what you changed and why, in plain language
