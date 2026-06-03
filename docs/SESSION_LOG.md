# ModelHub — Session Log & Project State

**Paste this file at the start of every Claude session to restore full context.**
**Update this file at the end of every session with what was completed.**

---

## Project identity

| Field | Value |
|---|---|
| Project | ModelHub |
| Owner | Jose Villegas (Ubik360) + partner |
| Repo | github.com/ubik360cloud/modelhub (branch: main) |
| App URL | app.modelhub.studio |
| Marketing URL | modelhub.studio |
| API URL | api.modelhub.studio |
| Local folder | C:\Users\jmvil\Projects\modelhub |

---

## How Jose works (important)

- Jose is NOT a developer. He is a marketer with strong structured thinking.
- He builds 100% via copy-paste: plans in Claude app → executes prompts in Claude extension in VS Code → pushes to GitHub → auto-deploy.
- He never writes code manually.
- He pastes bash commands from Claude into the VS Code terminal.
- Always give him **complete files**, never partial snippets.
- **Language rule:** Jose and Claude chat in English. All UI visible to users (including admin panel) is in Spanish. Code, variable names, comments, and function names are in English. No i18n library — Spanish hardcoded for now.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend app | React 18 + Vite + Tailwind CSS → Vercel (app.modelhub.studio) |
| Marketing site | React 18 + Vite + Tailwind CSS → Vercel (modelhub.studio) |
| Backend | Node 20 + Express → DigitalOcean App Platform (api.modelhub.studio) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Storage | Supabase Storage |
| Payments | Stripe |
| Email | Resend (hello@modelhub.studio) |
| Charts | Recharts |
| Rich text | TipTap (forum only) |
| State | Zustand |
| Icons | Lucide React |
| Routing | React Router v6 |

---

## VS Code setup (confirmed working)

- Node.js: v24.15.0
- Git: 2.53.0.windows.2
- Extensions installed: Claude, GitLens, GitHub Codespaces, CSS Peek, Highlight Matching Tag, Indent Rainbow, Material Design Icons, Power Mode, PowerShell, Python, Pylance, Python Debugger, Tailwind CSS IntelliSense, Tailwind Snippets, Tailwind CSS Tune, VS Code Icons, ESLint (Microsoft)

---

## Services status

| Service | Status | Details |
|---|---|---|
| GitHub | ✅ Live | github.com/ubik360cloud/modelhub — main branch |
| Supabase | ⏳ Project created | Project ID: emahjvfkqnyseonnoqkz — migrations NOT yet run |
| Vercel | ❌ Not connected | To do: connect after app/ folder exists |
| DigitalOcean | ❌ Not connected | To do: connect after backend/ folder exists |
| Stripe | ❌ Not configured | To do: create products after app is running |
| Resend | ❌ Not configured | To do: verify hello@modelhub.studio domain |
| Domain | ✅ Purchased | modelhub.studio — DNS not yet configured |

---

## Supabase project

- **URL:** https://supabase.com/dashboard/project/emahjvfkqnyseonnoqkz
- **Project ID:** emahjvfkqnyseonnoqkz
- **Region:** (confirm in dashboard)
- **Migrations run:** NONE yet
- **Migration files are in:** /supabase/migrations/ in the repo (001–005)
- **Next step:** Run migrations 001→005 in order from Supabase SQL Editor AFTER project structure is built in VS Code

---

## Roles

| Role | Description |
|---|---|
| admin | Jose + partner — full access, all panels |
| model | Webcam model — dashboard, earnings, goals, schedule, tips (premium), forum (premium) |
| studio | Studio coordinator — scheduling module only, free |

---

## Plans

| Plan | Price | Trial | Features |
|---|---|---|---|
| Básico | $20 USD/mo | 30 days free | Dashboard, earnings, goals, schedule view |
| Premium | $35 USD/mo | 30 days free | Everything + tips generator, forum |
| Studio | Free (Beta) | — | Scheduling module only |
| Beta coupon | BETA2026 | — | 100% off 3 months for beta testers |

---

## Beta testers

- 10 models (real users — to be onboarded)
- 2 studios (real studios Jose has relationships with)
- All get coupon BETA2026 applied manually in Stripe

---

## Build order (12 steps)

| Step | Module | Status |
|---|---|---|
| 1 | Project setup (folder structure, package.json, config files) | ⏳ Next |
| 2 | Auth (login, register, onboarding by role) | ❌ |
| 3 | Design system (components, layout, nav) | ❌ |
| 4 | Dashboard (model home) | ❌ |
| 5 | Earnings (manual entry + CSV/Excel import) | ❌ |
| 6 | Mis Metas (goal calculator) | ❌ |
| 7 | Scheduling (model view + studio panel) | ❌ |
| 8 | Profile | ❌ |
| 9 | Tips & content generator (Premium) | ❌ |
| 10 | Forum community (Premium) | ❌ |
| 11 | Admin panel | ❌ |
| 12 | Marketing site (modelhub.studio) | ❌ |

---

## Repository structure (target)

```
modelhub/
├── app/                    # React app → app.modelhub.studio
├── marketing/              # Landing page → modelhub.studio
├── backend/                # Express API → api.modelhub.studio
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_indexes.sql
│       ├── 004_seed_tips.sql
│       └── 005_realtime_triggers.sql
└── docs/
    ├── PROJECT.md
    ├── SCHEMA.md
    ├── MONETIZATION.md
    ├── BUILD_PROMPT.md
    └── SESSION_LOG.md      ← this file
```

---

## Current repo contents (confirmed on GitHub)

- ✅ docs/PROJECT.md
- ✅ docs/SCHEMA.md
- ✅ docs/MONETIZATION.md
- ✅ docs/BUILD_PROMPT.md
- ✅ docs/SESSION_LOG.md (this file)
- ✅ README.md
- ❌ supabase/migrations/ — files exist locally, not yet pushed
- ❌ app/ — not yet created
- ❌ backend/ — not yet created
- ❌ marketing/ — not yet created

---

## Key decisions log

| Decision | Answer |
|---|---|
| Scheduling notifications Phase 1 | In-app only (WhatsApp in Phase 2) |
| Beta studios | 2 real studios Jose has relationships with |
| Earnings entry | Both manual and CSV/Excel import |
| Goal calculator | Connects to logged earnings + manual fallback |
| Studio coordinators | 1 per studio in Beta |
| Schedule change approval | Coordinator approves/rejects inside the app |
| Forum access | Models only (Premium plan) — studios cannot access |
| App language | Spanish only (English in Phase 2) |
| Chat language | English (Jose + Claude) |
| Admin panel language | Spanish |
| Domain structure | modelhub.studio (marketing) + app.modelhub.studio (app) |
| Backend needed? | Yes — for Stripe webhooks, file imports, tips generator (Claude API) |
| ERP integration (NeumWebApp) | Phase 2 — view-only for now, manual import in Beta |
| i18n library | No — Spanish hardcoded |
| Studio plan pricing | Free during Beta, paid model TBD for Phase 2 |

---

## Design system

| Token | Value |
|---|---|
| Background | #0D0D0D / #111118 |
| Accent gold | #C9A96E |
| Accent rose | #E8B4B8 |
| Text primary | #F5F0E8 |
| Text muted | #6B7280 |
| Card style | Glassmorphism — backdrop-blur, rgba(255,255,255,0.08) border |
| Heading font | Playfair Display |
| Body font | DM Sans |
| Icons | Lucide React (outline) |
| Buttons | Outlined gold / filled gold on hover |
| Mobile nav | Bottom tab bar (replaces sidebar on mobile) |

---

## Session history

### Session 1 — June 2026
**Completed:**
- Created GitHub repo: ubik360cloud/modelhub (main branch)
- Resolved git merge conflict (README existed on remote)
- Pushed docs/ folder with 4 foundation files
- Confirmed VS Code setup (Node v24, Git 2.53, all extensions)
- Created Supabase project (ID: emahjvfkqnyseonnoqkz)
- Created 5 SQL migration files (locally, not yet in repo or run in Supabase)
- Created this SESSION_LOG

**Next session starts at:** Step 1 — Push supabase/migrations/ to GitHub, then paste Paso 1 build prompt into VS Code

---

## How to start the next session

1. Open this file
2. Paste its full contents into Claude at the start of the conversation
3. Say what you want to work on
4. Claude will know exactly where we are
