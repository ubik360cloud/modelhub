-- ModelHub Migration 001 — Initial Schema
-- Run this first in Supabase SQL Editor

-- PROFILES
-- Extends Supabase auth.users. One row per registered user.
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('admin', 'model', 'studio')),
  display_name        TEXT NOT NULL,
  avatar_url          TEXT,
  phone               TEXT,
  country             TEXT DEFAULT 'CO',
  plan                TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
  plan_started_at     TIMESTAMPTZ,
  plan_ends_at        TIMESTAMPTZ,
  stripe_customer_id  TEXT,
  onboarding_done     BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- STUDIOS
CREATE TABLE studios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  address         TEXT,
  city            TEXT DEFAULT 'Medellín',
  phone           TEXT,
  website         TEXT,
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ROOMS
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INT DEFAULT 1,
  equipment   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- STUDIO_MODELS
-- Links studios to their models
CREATE TABLE studio_models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  model_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT,
  UNIQUE(studio_id, model_id)
);

-- SHIFTS
CREATE TABLE shifts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  model_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  status      TEXT DEFAULT 'scheduled' CHECK (status IN (
                'scheduled',
                'confirmed',
                'change_requested',
                'cancelled',
                'completed'
              )),
  notes       TEXT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SHIFT_CHANGE_REQUESTS
CREATE TABLE shift_change_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id         UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  model_id         UUID NOT NULL REFERENCES profiles(id),
  type             TEXT NOT NULL CHECK (type IN ('cancel', 'extend', 'reschedule')),
  requested_start  TIMESTAMPTZ,
  requested_end    TIMESTAMPTZ,
  model_note       TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  coordinator_note TEXT,
  resolved_at      TIMESTAMPTZ,
  resolved_by      UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MODEL_PLATFORMS
CREATE TABLE model_platforms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  username      TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_id, platform_name)
);

-- EARNINGS
CREATE TABLE earnings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  platform     TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  currency     TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  notes        TEXT,
  source       TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import')),
  import_batch UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- EARNINGS_IMPORTS
CREATE TABLE earnings_imports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  rows_imported INT DEFAULT 0,
  rows_skipped  INT DEFAULT 0,
  status        TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- GOALS
CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('housing', 'vehicle', 'travel', 'education', 'other')),
  target_amount  NUMERIC(14,2) NOT NULL,
  currency       TEXT DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
  savings_pct    INT NOT NULL CHECK (savings_pct BETWEEN 10 AND 80),
  manual_income  NUMERIC(10,2),
  current_saved  NUMERIC(14,2) DEFAULT 0,
  is_completed   BOOLEAN DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- TIPS
CREATE TABLE tips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN (
                'iluminacion', 'camara', 'engagement', 'bio',
                'thumbnail', 'tokens', 'mentalidad', 'general'
              )),
  content     TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TIP_MENUS
CREATE TABLE tip_menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FORUM_ALIASES
-- Anonymous identity for the forum. Never expose model_id in public forum queries.
CREATE TABLE forum_aliases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id     UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  alias_name   TEXT NOT NULL UNIQUE,
  avatar_color TEXT DEFAULT '#C9A96E',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- FORUM_POSTS
CREATE TABLE forum_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN (
                'plataformas', 'ganancias', 'obs_tecnico',
                'bienestar', 'presentaciones', 'general'
              )),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  upvotes     INT DEFAULT 0,
  is_solved   BOOLEAN DEFAULT FALSE,
  is_pinned   BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FORUM_REPLIES
CREATE TABLE forum_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  upvotes     INT DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FORUM_VOTES
-- Prevents double voting on posts and replies
CREATE TABLE forum_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alias_id, target_type, target_id)
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_customer_id      TEXT,
  plan                    TEXT NOT NULL CHECK (plan IN ('basic', 'premium')),
  status                  TEXT NOT NULL CHECK (status IN (
                            'trialing', 'active', 'past_due', 'cancelled', 'incomplete'
                          )),
  trial_ends_at           TIMESTAMPTZ,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
