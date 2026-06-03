-- ModelHub Migration 002 — Row Level Security Policies
-- Run this second, after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────

-- Users can read and update their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can do everything on profiles
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── STUDIOS ───────────────────────────────────────────────────

-- Coordinator can manage their own studio
CREATE POLICY "studios_coordinator" ON studios
  FOR ALL USING (coordinator_id = auth.uid());

-- Admin can do everything
CREATE POLICY "studios_admin" ON studios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Models can read studios they belong to
CREATE POLICY "studios_model_read" ON studios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM studio_models
      WHERE studio_id = studios.id
      AND model_id = auth.uid()
      AND status = 'active'
    )
  );

-- ── ROOMS ─────────────────────────────────────────────────────

-- Studio coordinator can manage rooms
CREATE POLICY "rooms_coordinator" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE id = rooms.studio_id
      AND coordinator_id = auth.uid()
    )
  );

-- Admin can do everything
CREATE POLICY "rooms_admin" ON rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── STUDIO_MODELS ─────────────────────────────────────────────

-- Coordinator manages their studio's model list
CREATE POLICY "studio_models_coordinator" ON studio_models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE id = studio_models.studio_id
      AND coordinator_id = auth.uid()
    )
  );

-- Model can see their own studio links
CREATE POLICY "studio_models_own" ON studio_models
  FOR SELECT USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "studio_models_admin" ON studio_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── SHIFTS ────────────────────────────────────────────────────

-- Model can see their own shifts
CREATE POLICY "shifts_model_select" ON shifts
  FOR SELECT USING (model_id = auth.uid());

-- Studio coordinator can manage all shifts for their studio
CREATE POLICY "shifts_coordinator" ON shifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE id = shifts.studio_id
      AND coordinator_id = auth.uid()
    )
  );

-- Admin can do everything
CREATE POLICY "shifts_admin" ON shifts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── SHIFT_CHANGE_REQUESTS ─────────────────────────────────────

-- Model can create and view their own requests
CREATE POLICY "change_requests_model" ON shift_change_requests
  FOR ALL USING (model_id = auth.uid());

-- Coordinator can view and resolve requests for their studio's shifts
CREATE POLICY "change_requests_coordinator" ON shift_change_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shifts s
      JOIN studios st ON st.id = s.studio_id
      WHERE s.id = shift_change_requests.shift_id
      AND st.coordinator_id = auth.uid()
    )
  );

-- Admin can do everything
CREATE POLICY "change_requests_admin" ON shift_change_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── NOTIFICATIONS ─────────────────────────────────────────────

-- Users only see their own notifications
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Admin can do everything
CREATE POLICY "notifications_admin" ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── MODEL_PLATFORMS ───────────────────────────────────────────

-- Model manages their own platforms
CREATE POLICY "model_platforms_own" ON model_platforms
  FOR ALL USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "model_platforms_admin" ON model_platforms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── EARNINGS ──────────────────────────────────────────────────

-- Model manages their own earnings
CREATE POLICY "earnings_own" ON earnings
  FOR ALL USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "earnings_admin" ON earnings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── EARNINGS_IMPORTS ──────────────────────────────────────────

CREATE POLICY "earnings_imports_own" ON earnings_imports
  FOR ALL USING (model_id = auth.uid());

CREATE POLICY "earnings_imports_admin" ON earnings_imports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── GOALS ─────────────────────────────────────────────────────

-- Model manages their own goals
CREATE POLICY "goals_own" ON goals
  FOR ALL USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "goals_admin" ON goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── TIPS ──────────────────────────────────────────────────────

-- Anyone authenticated can read active tips
CREATE POLICY "tips_read_active" ON tips
  FOR SELECT USING (is_active = TRUE AND auth.uid() IS NOT NULL);

-- Only admin can create, update, delete tips
CREATE POLICY "tips_admin" ON tips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── TIP_MENUS ─────────────────────────────────────────────────

-- Model manages their own tip menus
CREATE POLICY "tip_menus_own" ON tip_menus
  FOR ALL USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "tip_menus_admin" ON tip_menus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FORUM_ALIASES ─────────────────────────────────────────────

-- Model can manage their own alias
CREATE POLICY "forum_aliases_own" ON forum_aliases
  FOR ALL USING (model_id = auth.uid());

-- Premium models can read all aliases (needed to display forum posts)
CREATE POLICY "forum_aliases_premium_read" ON forum_aliases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'model'
      AND plan = 'premium'
    )
  );

-- Admin can do everything
CREATE POLICY "forum_aliases_admin" ON forum_aliases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FORUM_POSTS ───────────────────────────────────────────────

-- Premium models can read non-deleted posts
CREATE POLICY "forum_posts_premium_read" ON forum_posts
  FOR SELECT USING (
    is_deleted = FALSE
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'model'
      AND plan = 'premium'
    )
  );

-- Premium models can create posts using their alias
CREATE POLICY "forum_posts_premium_insert" ON forum_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_aliases fa
      JOIN profiles p ON p.id = fa.model_id
      WHERE fa.id = forum_posts.alias_id
      AND p.id = auth.uid()
      AND p.plan = 'premium'
    )
  );

-- Models can update/delete their own posts
CREATE POLICY "forum_posts_own_update" ON forum_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM forum_aliases
      WHERE id = forum_posts.alias_id
      AND model_id = auth.uid()
    )
  );

-- Admin can do everything
CREATE POLICY "forum_posts_admin" ON forum_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FORUM_REPLIES ─────────────────────────────────────────────

-- Premium models can read non-deleted replies
CREATE POLICY "forum_replies_premium_read" ON forum_replies
  FOR SELECT USING (
    is_deleted = FALSE
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'model'
      AND plan = 'premium'
    )
  );

-- Premium models can create replies
CREATE POLICY "forum_replies_premium_insert" ON forum_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_aliases fa
      JOIN profiles p ON p.id = fa.model_id
      WHERE fa.id = forum_replies.alias_id
      AND p.id = auth.uid()
      AND p.plan = 'premium'
    )
  );

-- Admin can do everything
CREATE POLICY "forum_replies_admin" ON forum_replies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FORUM_VOTES ───────────────────────────────────────────────

-- Premium models can manage their own votes
CREATE POLICY "forum_votes_premium" ON forum_votes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forum_aliases fa
      JOIN profiles p ON p.id = fa.model_id
      WHERE fa.id = forum_votes.alias_id
      AND p.id = auth.uid()
      AND p.plan = 'premium'
    )
  );

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────

-- Model can view their own subscription
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (model_id = auth.uid());

-- Admin can do everything
CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Backend service role manages subscriptions (via Stripe webhooks)
-- This is handled automatically by the service_role key in the backend
