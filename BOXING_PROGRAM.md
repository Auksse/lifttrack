# Boxing S&C Program — Reference Data for Gym Log App

## Purpose of This File

This file defines the structured training program the user is following. It exists to:
- Ensure all required exercises are present in the exercise library
- Provide the 3 session templates with full detail for the template feature
- Define progression rules so gains tracking can flag when to increase load
- Serve as the source of truth when building or extending any boxing-program-related features

Do NOT rebuild features that already exist. Extend them. The app already has:
- Workout logging (date, exercise, sets, reps, weight)
- An exercise library (extensive but may be missing some exercises listed below)
- History views and gains/progress charts
- A template feature (newly implemented — needs validation and population)

---

## Program Overview

**Goal:** Physical foundation for English boxing — pre-boxing phase, gym only
**Frequency:** 3 gym sessions per week
**User level:** Beginner to early-intermediate, hypertrophy background
**Phase duration:** 12 weeks (3 phases of 4 weeks each)
**Deloads:** Week 4, Week 8, Week 12

**Priority order:**
1. Structural balance (shoulder/scapular health, elbow health, neck)
2. Strength foundation (hip hinge, lower body, vertical pull, pressing)
3. Explosive power (jumps, med ball throws, speed work)
4. Aesthetics (secondary — chest, shoulders, abs happen as byproduct)

**Important user constraint:** User has elbow discomfort on push days.
Barbell bench press is intentionally excluded. Neutral-grip dumbbell pressing
and landmine press are used instead. Never suggest swapping these back to
barbell bench unless elbow is fully symptom-free for several weeks.

---

## Weekly Schedule

| Day       | Session                                      |
|-----------|----------------------------------------------|
| Monday    | Session A — Power + Lower Body               |
| Tuesday   | Rest / optional Zone 2 run (20–30 min)       |
| Wednesday | Session B — Push + Rotation + Core           |
| Thursday  | Rest / optional Zone 2 run (20–30 min)       |
| Friday    | Session C — Pull + Unilateral + Conditioning |
| Saturday  | Rest / optional easy activity                |
| Sunday    | Full rest                                    |

---

## Session A — Power + Lower Body

**Objective:** Explosive lower chain, hip hinge, squat pattern, posterior chain
**Duration:** ~75 min

### Warm-Up (10 min — do not log as working sets)
- Hip circles + leg swings — 2×10 each direction
- Glute bridge — 2×15 (2-sec hold at top)
- Goblet squat light — 2×8 (slow, deep, mobility focus)
- Box jump or broad jump — 3×3 (CNS activation, full effort)

### A — Power
| Exercise          | Sets | Reps | Rest     | Notes                                                              |
|-------------------|------|------|----------|--------------------------------------------------------------------|
| Trap Bar Deadlift | 4    | 4–5  | 2.5–3min | Explosive concentric. If no trap bar, use conventional deadlift.   |

### B — Strength Compound
| Exercise           | Sets | Reps | Rest   | Notes                                              |
|--------------------|------|------|--------|----------------------------------------------------|
| Back Squat         | 3    | 4–6  | 2.5min | Heavier than hypertrophy work. Bar over mid-foot.  |
| Romanian Deadlift  | 3    | 6–8  | 2min   | 3-sec eccentric. Loaded stretch at bottom.         |

### C — Unilateral + Anti-Rotation
| Exercise                              | Sets | Reps         | Rest              | Notes                                                                 |
|---------------------------------------|------|--------------|-------------------|-----------------------------------------------------------------------|
| Rear-Foot Elevated Split Squat (RFESS)| 3    | 6–8 each leg | 90s between legs  | Dumbbells. Front foot far enough forward so knee tracks over toes.    |
| Pallof Press                          | 3    | 10 each side | 60s               | 2-sec pause at full extension. Cable or band. Hips must not rotate.   |

### D — Accessory + Prehab
| Exercise             | Sets | Reps  | Rest | Notes                                                      |
|----------------------|------|-------|------|------------------------------------------------------------|
| Hip Thrust           | 3    | 10–12 | 90s  | Barbell. Full hip extension at top. Drive through heels.   |
| Standing Calf Raise  | 3    | 12–15 | 60s  | Full range. Deep stretch at bottom, pause at top.          |

---

## Session B — Push + Rotation + Core

**Objective:** Elbow-friendly pressing, rotational power, trunk stability, neck strength
**Duration:** ~70 min

### Warm-Up (8 min — do not log as working sets)
- Band pull-apart — 3×15
- Wall slide — 2×10
- Light dumbbell external rotation — 2×12 each (2–3 kg only)
- Med ball chest pass against wall — 3×5 (4–6 kg, maximum intent)

### A — Explosive Power
| Exercise                        | Sets | Reps         | Rest | Notes                                                                                    |
|---------------------------------|------|--------------|------|------------------------------------------------------------------------------------------|
| Med Ball Rotational Throw (wall)| 4    | 5 each side  | 90s  | Most boxing-specific exercise in the program. Drive from back hip. 4–6 kg ball. Max intent. |

### B — Main Press (Elbow-Friendly)
| Exercise                          | Sets | Reps | Rest   | Notes                                                                                       |
|-----------------------------------|------|------|--------|---------------------------------------------------------------------------------------------|
| Neutral-Grip Dumbbell Bench Press | 4    | 5–8  | 2.5min | Palms facing each other throughout. 2–3 sec descent. Replaces barbell bench (elbow issues). |
| Landmine Press                    | 3    | 8–10 each | 90s | Single arm, standing or half-kneeling. New movement — start conservative.               |

### C — Overhead
| Exercise                      | Sets | Reps | Rest | Notes                                                                         |
|-------------------------------|------|------|------|-------------------------------------------------------------------------------|
| Dumbbell Overhead Press (seated)| 3  | 6–8  | 2min | Neutral-ish grip. Do not fully lock out if elbow discomfort present.          |

### D — Core + Trunk
| Exercise           | Sets | Reps          | Rest | Notes                                                              |
|--------------------|------|---------------|------|--------------------------------------------------------------------|
| Dead Bug           | 3    | 8 each side   | 60s  | Lower back flat on floor throughout. Full contralateral extension. |
| Hanging Knee Raise | 3    | 10–15         | 60s  | No swing. Tuck knees if straight-leg raise is too hard.            |
| Ab Wheel Rollout   | 3    | 6–10          | 60s  | From knees. Stop when lower back sags. Increase range weekly.      |

### E — Neck (5 min — non-optional)
| Exercise                        | Sets | Duration / Reps      | Rest | Notes                                                              |
|---------------------------------|------|----------------------|------|--------------------------------------------------------------------|
| Isometric Neck Hold (4 planes)  | 2    | 10s each direction   | 20s  | Push hand against head, resist with neck. Front/back/left/right.  |
| Band Neck Flexion/Extension     | 2    | 15 reps each         | 30s  | Light band. Only add after isometric holds feel easy (2–3 weeks). |

---

## Session C — Pull + Unilateral + Conditioning

**Objective:** Vertical and horizontal pulling, single-leg strength, shoulder prehab, conditioning
**Duration:** ~75 min

### Warm-Up (8 min — do not log as working sets)
- Cat-cow + thoracic rotation — 2×8 each
- Band pull-apart + face pull — 2×15
- Scapular pull-up (dead hang shrug) — 2×10

### A — Vertical Pull
| Exercise          | Sets | Reps | Rest   | Notes                                                                        |
|-------------------|------|------|--------|------------------------------------------------------------------------------|
| Weighted Pull-Up  | 4    | 4–6  | 2.5min | Add 5 kg if bodyweight is easy (3+ RIR). If not ready, use 3-sec negative.  |

### B — Horizontal Pull
| Exercise                  | Sets | Reps         | Rest              | Notes                                                    |
|---------------------------|------|--------------|-------------------|----------------------------------------------------------|
| Pendlay Row               | 4    | 5–6          | 2min              | Dead stop from floor each rep. No swing or momentum.    |
| Single-Arm Dumbbell Row   | 3    | 8–10 each    | 60s (alternate)   | Elbow drives back and up. Full stretch at bottom.        |

### C — Unilateral Lower
| Exercise           | Sets | Reps      | Rest | Notes                                                          |
|--------------------|------|-----------|------|----------------------------------------------------------------|
| Dumbbell Step-Up   | 3    | 8–10 each | 90s  | Box at knee height. Drive through heel of working leg only.   |

### D — Shoulder Prehab + Elbow
| Exercise                  | Sets  | Reps      | Rest | Notes                                                                        |
|---------------------------|-------|-----------|------|------------------------------------------------------------------------------|
| Face Pull                 | 3     | 15–20     | 60s  | Pull to forehead level. External rotate at end — hands above elbows. Never heavy. |
| Hammer Curl               | 3     | 10–12     | 60s  | Neutral grip. No swing. Easier on elbow than supinated curl.                 |
| Wrist Roller / Wrist Curl | 2–3   | To fatigue| 60s  | Very light. Both flexion and extension. Connective tissue work.              |

### E — Conditioning Finisher (8–10 min)
| Exercise                                   | Rounds | Structure                                          | Rest between rounds |
|--------------------------------------------|--------|----------------------------------------------------|---------------------|
| Skip + Push-Up + DB Shadow Boxing circuit  | 4      | 60s skip / 10 push-ups / 60s shadow boxing (0.5–1 kg DBs) | 60s           |

### F — Neck (5 min)
| Exercise                       | Sets | Duration / Reps    | Notes                  |
|--------------------------------|------|--------------------|------------------------|
| Isometric Neck Hold (4 planes) | 2    | 10s each direction | Same protocol as Sess B|

---

## Week 1 Starting Loads

Estimated from known user data:
- Bench press goal: 65 kg × 10 (~87 kg estimated 1RM)
- Pull-ups: 4 × 6–10 bodyweight
- Barbell row current working weight: ~60–65 kg
- Back squat current working weight: ~60–70 kg for sets of 5–8
- RDL current working weight: likely similar range
- Cable lateral raise: 2.3 kg | Cable triceps extension: 11 kg (accessory anchors)
- Known issue: elbow discomfort on push days

### Session A
| Exercise                   | Conservative | Likely   | Aggressive |
|----------------------------|-------------|----------|------------|
| Trap Bar Deadlift          | 70 kg       | 80 kg    | 90 kg      |
| Back Squat                 | 50 kg       | 60 kg    | 70 kg      |
| Romanian Deadlift          | 50 kg       | 60 kg    | 70 kg      |
| RFESS (each dumbbell)      | 10 kg       | 14 kg    | 18 kg      |
| Pallof Press               | 5 kg cable  | 7–8 kg   | 10 kg      |
| Hip Thrust                 | BW only     | 40 kg    | 60 kg      |
| Standing Calf Raise        | BW only     | 20 kg    | 40 kg      |

### Session B
| Exercise                          | Conservative | Likely      | Aggressive  |
|-----------------------------------|-------------|-------------|-------------|
| Med Ball Rotational Throw         | 3 kg        | 4–5 kg      | 6 kg        |
| Neutral-Grip DB Bench (each DB)   | 24 kg       | 28 kg       | 32 kg       |
| Landmine Press (added plate)      | 10 kg       | 15 kg       | 20 kg       |
| DB Overhead Press seated (each)   | 16 kg       | 20 kg       | 24 kg       |
| Dead Bug                          | Bodyweight  | Bodyweight  | Bodyweight  |
| Hanging Knee Raise                | Bodyweight  | Bodyweight  | Bodyweight  |
| Ab Wheel Rollout                  | BW (knees)  | BW (knees)  | BW (knees)  |

### Session C
| Exercise                       | Conservative | Likely      | Aggressive  |
|--------------------------------|-------------|-------------|-------------|
| Weighted Pull-Up               | Bodyweight  | BW + 5 kg   | BW + 10 kg  |
| Pendlay Row                    | 50 kg       | 60 kg       | 70 kg       |
| Single-Arm DB Row (each)       | 26 kg       | 32 kg       | 36 kg       |
| Dumbbell Step-Up (each)        | 12 kg       | 16 kg       | 20 kg       |
| Face Pull                      | 5–6 kg      | 8 kg        | 10 kg       |
| Hammer Curl                    | 12 kg       | 14–16 kg    | 18 kg       |
| DB Shadow Boxing (each hand)   | 0.5 kg      | 0.5 kg      | 1 kg        |

---

## Progression Rules

### Load Validation — After First Session on Any Exercise
The weight is correct if the last set ends with exactly 2–3 reps clearly remaining.
- 4+ reps clearly remained → add 5 kg next session
- 1 rep remaining, grinding → repeat same weight
- Failed reps on 2+ sets → drop 5–10 kg, treat as calibration

### Phase 1 — Weeks 1–4: Foundation & Technique

**Main lifts** (Trap Bar DL, Back Squat, DB Bench, Pendlay Row, Weighted Pull-Up):
- Add 2.5 kg per session if all reps completed with 2+ RIR on last set
- Repeat same weight if all reps completed but only 1 RIR on last set
- Drop 5 kg if failed reps on 2+ sets

**Accessory lifts** (RFESS, Single-Arm Row, Step-Up, Hip Thrust):
- Move to next dumbbell only after hitting the TOP of the rep range on ALL sets
- Stay at same weight until then

**Core and prehab:**
- Progress range of motion first, not load
- Ab wheel: increase rollout distance weekly
- Pallof press: increase hold time before adding load

**Power exercises** (med ball, box jumps):
- Do not increase load until technique is clean and hip rotation clearly drives the throw

### Phase 2 — Weeks 5–8: Strength Load

Rep range changes from Phase 1:
- Trap Bar Deadlift: 5×3–4
- Back Squat: 4×3–5
- Weighted Pull-Up: 4×4–5
- DB Bench: 4×6–8 (same range, increase load when top is reached)

Progression rate: add 2.5 kg every SECOND session (slower than Phase 1)
Stall rule: same weight fails 2 consecutive sessions → reduce by 5%, rebuild

### Phase 3 — Weeks 9–12: Power Emphasis

New additions:
- Speed deadlifts: 3×3 at 60% of working weight before heavy trap bar sets (maximum bar speed)
- Broad jumps: 3×3 added before Session A as second power primer
- Hip Thrust replaced by Single-Leg Hip Thrust
- Med ball throws: increase to 5×5 each side, or add overhead slam (5×5)

Wave loading pattern for main lifts if stalled:
- Week 9: 3×5 | Week 10: 4×4 | Week 11: 5×3 | Week 12: deload

### Deload Weeks (Week 4, Week 8, Week 12)
- Same exercises and structure
- Reduce all loads by 40–50%
- Reduce main lift sets by 1
- Prehab, neck, core, and conditioning: do NOT deload — keep full volume

**Unplanned deload triggers (take immediately if any of these occur):**
- Motivation very low for 2+ consecutive sessions
- Main lift performance drops for 2 consecutive sessions despite adequate sleep
- Joint soreness that does not clear between sessions

---

## Exercise Library — Required Exercises

Cross-check this list against the existing exercise library and add any that are missing.

### Likely already present (from user's previous hypertrophy program)
- Back Squat
- Romanian Deadlift
- Barbell Row
- Pull-Up
- Dumbbell Overhead Press
- Hammer Curl
- Face Pull
- Standing Calf Raise
- Hanging Knee Raise

### Check and add if missing
| Exercise                          | Category              | Notes / Aliases                        |
|-----------------------------------|-----------------------|----------------------------------------|
| Trap Bar Deadlift                 | Legs / Hinge          | Also: Hex Bar Deadlift                 |
| Rear-Foot Elevated Split Squat    | Legs / Unilateral     | Also: Bulgarian Split Squat, RFESS     |
| Hip Thrust                        | Legs / Glute          | Barbell variation                      |
| Single-Leg Hip Thrust             | Legs / Glute          | Phase 3 replacement for Hip Thrust     |
| Pallof Press                      | Core / Anti-Rotation  | Cable or band                          |
| Dead Bug                          | Core / Anti-Extension | Bodyweight                             |
| Ab Wheel Rollout                  | Core / Anti-Extension |                                        |
| Neutral-Grip Dumbbell Bench Press | Chest / Press         | Distinct from standard DB bench press  |
| Landmine Press                    | Shoulders / Press     | Single-arm, standing or kneeling       |
| Pendlay Row                       | Back / Horizontal Pull| Distinct from standard barbell row     |
| Single-Arm Dumbbell Row           | Back / Horizontal Pull|                                        |
| Dumbbell Step-Up                  | Legs / Unilateral     |                                        |
| Med Ball Rotational Throw         | Power / Rotational    | Wall-facing                            |
| Med Ball Overhead Slam            | Power / Full Body     | Phase 3 addition                       |
| Isometric Neck Hold               | Neck / Prehab         | 4 planes (front/back/left/right)       |
| Band Neck Flexion/Extension       | Neck / Strength       |                                        |
| Wrist Roller                      | Forearm / Prehab      |                                        |
| DB Shadow Boxing                  | Conditioning / Boxing | Very light DBs only (0.5–1 kg)         |

---

## Template Definitions

Use these to create or validate the 3 session templates in the template feature.
Templates should be reusable, loadable into a new workout session, and pre-populate
exercises with their prescribed sets, reps, and rest times.

### Template: "Boxing A — Power + Lower"
Day: Monday | Target duration: 75 min

| Order | Exercise                       | Sets | Reps         | Rest     |
|-------|--------------------------------|------|--------------|----------|
| 1     | Trap Bar Deadlift              | 4    | 4–5          | 150s     |
| 2     | Back Squat                     | 3    | 4–6          | 150s     |
| 3     | Romanian Deadlift              | 3    | 6–8          | 120s     |
| 4     | Rear-Foot Elevated Split Squat | 3    | 6–8 each     | 90s      |
| 5     | Pallof Press                   | 3    | 10 each side | 60s      |
| 6     | Hip Thrust                     | 3    | 10–12        | 90s      |
| 7     | Standing Calf Raise            | 3    | 12–15        | 60s      |

### Template: "Boxing B — Push + Core"
Day: Wednesday | Target duration: 70 min

| Order | Exercise                          | Sets | Reps         | Rest     |
|-------|-----------------------------------|------|--------------|----------|
| 1     | Med Ball Rotational Throw         | 4    | 5 each side  | 90s      |
| 2     | Neutral-Grip Dumbbell Bench Press | 4    | 5–8          | 150s     |
| 3     | Landmine Press                    | 3    | 8–10 each    | 90s      |
| 4     | Dumbbell Overhead Press (seated)  | 3    | 6–8          | 120s     |
| 5     | Dead Bug                          | 3    | 8 each side  | 60s      |
| 6     | Hanging Knee Raise                | 3    | 10–15        | 60s      |
| 7     | Ab Wheel Rollout                  | 3    | 6–10         | 60s      |
| 8     | Isometric Neck Hold               | 2    | 10s × 4 planes | 20s   |

### Template: "Boxing C — Pull + Conditioning"
Day: Friday | Target duration: 75 min

| Order | Exercise                 | Sets  | Reps         | Rest     |
|-------|--------------------------|-------|--------------|----------|
| 1     | Weighted Pull-Up         | 4     | 4–6          | 150s     |
| 2     | Pendlay Row              | 4     | 5–6          | 120s     |
| 3     | Single-Arm Dumbbell Row  | 3     | 8–10 each    | 60s      |
| 4     | Dumbbell Step-Up         | 3     | 8–10 each    | 90s      |
| 5     | Face Pull                | 3     | 15–20        | 60s      |
| 6     | Hammer Curl              | 3     | 10–12        | 60s      |
| 7     | Wrist Roller             | 2–3   | To fatigue   | 60s      |
| 8     | Conditioning Circuit     | 4 rounds | 60s skip / 10 push-ups / 60s shadow boxing | 60s |
| 9     | Isometric Neck Hold      | 2     | 10s × 4 planes | 20s   |

---

## Suggested Tasks for Claude Code (Priority Order)

Work through these in order. Do not rebuild existing features — extend them.

1. **Verify exercise library**
   Cross-check the "Check and add if missing" table against the existing library.
   Add any missing exercises with correct name and category. Check for duplicates or
   near-matches (e.g. "Bulgarian Split Squat" may already exist as an alias for RFESS).

2. **Create the 3 session templates**
   Use the Template Definitions above to populate the template feature with all 3 sessions.
   Validate that templates save correctly and can be loaded into a new workout session
   with all exercises, sets, reps, and rest times pre-populated.

3. **Test template → workout → history flow**
   Start a workout from each template, log at least one set per exercise, save the session,
   and confirm it appears correctly in workout history and any progress/gains charts.

4. **Progression flag logic**
   For the 5 main lifts (Trap Bar DL, Back Squat, DB Bench, Pendlay Row, Weighted Pull-Up),
   add logic that flags when the user has completed all sets at the top of the prescribed
   rep range — this should trigger a suggestion to increase load by 2.5 kg next session.

5. **Deload detection (optional)**
   If the app tracks weeks, surface a deload reminder at weeks 4, 8, and 12.
   If not, a manual deload toggle on the session level would be sufficient.

6. **Phase tracking (optional)**
   Allow the user to mark which phase they are in (1, 2, or 3) so the progression
   rules and rep ranges update accordingly in the session view or template.
