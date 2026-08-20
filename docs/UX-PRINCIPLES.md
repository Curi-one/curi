# UX & behavioural principles

Curi UX must feel **effortless, trustworthy, and calm** — world-class without casino mechanics. Apply on every screen; run `curi-ux-review` before merge.

Brand reference: [`prototypes/web/curi-brand-guidelines-v2.md`](../prototypes/web/curi-brand-guidelines-v2.md).

---

## Mental models (what the user thinks is happening)

| User belief | Product truth | UI job |
|---|---|---|
| “I’m learning one thing today per topic” | One lesson/path/day | Today: **Still to read** vs **Already today** |
| “My path fits what I asked for” | Clarify + depth shaped the outline | Show topic + depth label on path; don’t hide personalisation |
| “This is factual” | Perplexity + sources | **Sources** footnotes on lessons and quiz |
| “I’m building a habit” | Streak from activity | One global streak/day; streak at risk, not guilt |
| “Free is real; paid is more paths” | Same lesson quality | Paywall on 3rd path only, never on lesson body |

If the UI contradicts these beliefs, fix the UI — not the user’s expectation.

---

## Behavioural psychology (ethical use)

### Commitment & consistency

- **Auth after first quiz** — user has invested; gate matches value delivered (lesson + quiz), not signup wall at landing.  
- **Clarify** — small sequential choices (1 question/screen) increase ownership of the path without fatigue.

### Endowment & progress

- User “owns” paths listed on Today.  
- Progress bars may show slight endowed start **only as visual** — stored progress stays honest (DECISIONS).  
- Completing one path when others remain → **Back to Today**, not “see you tomorrow” (accurate multi-path model).

### Cognitive load

- **One primary action per screen** — read, answer, or choose depth.  
- **Three tabs max** — Today · Library · Explore.  
- **No dashboards on Today** — streak links to Progress; don’t compete with due lessons.

### Loss aversion (streak)

- Streak visible but **not punitive** — orange “at risk”, no shame copy, no push spam.  
- Missing a day resets streak; explain quietly, offer return via Today.

### Trust & credibility

- Sources visible; quiz “why” cites when factual.  
- No fake urgency (“only 2 spots left”). Upgrade screen factual (DECISIONS).

### Decision fatigue

- Clarify options: **3–4 tap labels**, full sentences, no jargon without context.  
- Depth: three choices with **time anchors** (Essentials / Fluent / Thorough) — predictable commitment.

### Quiz feedback loop

- **Lesson feel** after MCQ — one tap, four options, required.  
- Frames as tuning *your* path, not grading the user.  
- Copy: “How did that land?” not “Rate this lesson”.

### Variable reward (sparingly)

- Generating screen streams titles — anticipation without slot-machine noise.  
- Quiz MCQ feedback immediate — micro-reward for effort, not points/badges.

---

## Interaction standards

| Area | Standard |
|---|---|
| Touch targets | ≥ 44px; bottom CTAs docked on mobile |
| Loading | Skeleton or streaming titles; never blank > 300ms without feedback |
| Errors | Plain language + retry; never raw API errors |
| Empty states | One CTA (Explore); no clutter |
| Motion | Spring ease `cubic-bezier(0.16, 1, 0.3, 1)`; purposeful, not decorative |
| Copy | Editorial, second person sparingly; Fraunces for headlines |

---

## Flow-specific UX

### Landing

- Topic input autofocus; anxiety reducer: “Free to start · No account needed”.  
- Typewriter optional; must not block input.

### Clarify

- Progress “2 of 4”; back allowed.  
- Depth last; labels + subcopy from FLOWS.md.

### Lesson

- ~3 min read; Sources below takeaways.  
- Quiz CTA fixed after scroll.

### Quiz

- MCQ first; feel question **last**, separate screen.  
- Feel options: **Too easy · Just right · Too hard · Confusing** — no numeric scale.  
- User understands: “Tomorrow’s lesson adjusts to this.”

### Today (multi-path)

- Due paths first, visually primary.  
- Done today: dimmed, re-read only.  
- Header: “2 of 3 still to read” — scannable counts.

---

## Anti-patterns (reject in review)

- Signup before lesson 1  
- Streak as primary hero over due lessons  
- Red error states on wrong quiz answers  
- Infinite scroll feeds, badges, leaderboards  
- Dark patterns on upgrade (fake timers, pre-checked add-ons)  
- Hiding sources on AI content  

---

## Review output format

Use in UX agent and PR comments:

| Severity | Meaning |
|---|---|
| **Critical** | Breaks mental model, trust, or FLOWS — block merge |
| **Suggestion** | Meaningful improvement to clarity or calm |
| **Nice** | Polish |

Skill: `.cursor/skills/curi-ux-review/`
