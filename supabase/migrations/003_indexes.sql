-- ModelHub Migration 003 — Performance Indexes
-- Run this third, after 002_rls_policies.sql

-- Shifts: most queried by model and studio, filtered by date
CREATE INDEX idx_shifts_model_id ON shifts(model_id);
CREATE INDEX idx_shifts_studio_id ON shifts(studio_id);
CREATE INDEX idx_shifts_room_id ON shifts(room_id);
CREATE INDEX idx_shifts_starts_at ON shifts(starts_at);
CREATE INDEX idx_shifts_status ON shifts(status);

-- Shift change requests: queried by shift and model
CREATE INDEX idx_change_requests_shift_id ON shift_change_requests(shift_id);
CREATE INDEX idx_change_requests_model_id ON shift_change_requests(model_id);
CREATE INDEX idx_change_requests_status ON shift_change_requests(status);

-- Earnings: most queried by model and date
CREATE INDEX idx_earnings_model_id ON earnings(model_id);
CREATE INDEX idx_earnings_date ON earnings(date);
CREATE INDEX idx_earnings_model_date ON earnings(model_id, date);
CREATE INDEX idx_earnings_platform ON earnings(platform);

-- Goals: queried by model
CREATE INDEX idx_goals_model_id ON goals(model_id);
CREATE INDEX idx_goals_is_completed ON goals(is_completed);

-- Notifications: queried by user, filtered by read status
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Studio models: queried in both directions
CREATE INDEX idx_studio_models_studio_id ON studio_models(studio_id);
CREATE INDEX idx_studio_models_model_id ON studio_models(model_id);
CREATE INDEX idx_studio_models_status ON studio_models(status);

-- Rooms: queried by studio
CREATE INDEX idx_rooms_studio_id ON rooms(studio_id);

-- Model platforms: queried by model
CREATE INDEX idx_model_platforms_model_id ON model_platforms(model_id);

-- Forum posts: queried by category, filtered by deleted/pinned
CREATE INDEX idx_forum_posts_alias_id ON forum_posts(alias_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_is_deleted ON forum_posts(is_deleted);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_upvotes ON forum_posts(upvotes DESC);

-- Forum replies: queried by post
CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_alias_id ON forum_replies(alias_id);

-- Forum aliases: unique lookup by model
CREATE INDEX idx_forum_aliases_model_id ON forum_aliases(model_id);

-- Subscriptions: queried by model and Stripe IDs
CREATE INDEX idx_subscriptions_model_id ON subscriptions(model_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Tip menus: queried by model
CREATE INDEX idx_tip_menus_model_id ON tip_menus(model_id);

-- Tips: queried by category and active status
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_is_active ON tips(is_active);
