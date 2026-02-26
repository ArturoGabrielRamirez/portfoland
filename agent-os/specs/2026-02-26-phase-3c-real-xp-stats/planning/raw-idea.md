# Raw Idea — Phase 3C: Real XP & Stats

**Date:** 2026-02-26
**Status:** Unprocessed — raw capture

---

## User Description (verbatim)

Replace all mock/hardcoded data in the Tech Mode dashboard with real calculations. XP is computed from the user's actual data: work experiences, skills, projects, and (future) GitHub activity. Goals and level thresholds are dynamic, not hardcoded. The dashboard stats panels (HexStatGrid, WelcomeCard XP bar, level, streak) show real numbers pulled from the database.

---

## Key Components Mentioned

- HexStatGrid
- WelcomeCard XP bar
- Level display
- Streak display

## Data Sources Mentioned

- Work experiences
- Skills
- Projects
- GitHub activity (future / placeholder)

## Core Problem

All dashboard stats in Tech Mode currently show hardcoded/mock values. Users see fake XP, fake levels, fake streaks — breaking the credibility of the portfolio dashboard.

## Desired Outcome

- XP calculated dynamically from real user profile data
- Level and level thresholds derived from XP (not hardcoded)
- Goals are dynamic (based on what the user has and hasn't completed)
- All stat panels pull from the database, not from local constants
