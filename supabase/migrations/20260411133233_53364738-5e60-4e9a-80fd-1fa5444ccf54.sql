
-- Boosts table
CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL,
  multiplier numeric NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boosts" ON public.boosts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own boosts" ON public.boosts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all boosts" ON public.boosts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Tasks table (admin-managed)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  reward_usd numeric NOT NULL DEFAULT 0,
  task_type text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active tasks" ON public.tasks FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Task completions
CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  completed_at timestamptz DEFAULT now(),
  reward_usd numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profile safety columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpu_throttle integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS charge_only_mining boolean DEFAULT true;

-- Seed default tasks
INSERT INTO public.tasks (title, description, reward_usd, task_type) VALUES
  ('Watch a Video Ad', 'Watch a short video to earn bonus credits', 0.05, 'video_ad'),
  ('Follow on Social Media', 'Follow AfriMine on Twitter/X for a bonus', 0.10, 'social_follow'),
  ('Share on WhatsApp', 'Share your referral link on WhatsApp', 0.08, 'share'),
  ('Daily Check-in', 'Open the app daily to claim your streak bonus', 0.02, 'checkin'),
  ('Invite a Friend', 'Get a friend to sign up with your referral code', 0.25, 'invite');
