-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create enum for payout method
CREATE TYPE public.payout_method AS ENUM ('mobile_money', 'usdt', 'lightning');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table with referral code
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES auth.users(id),
    balance_usd DECIMAL(12, 6) DEFAULT 0,
    total_earned_usd DECIMAL(12, 6) DEFAULT 0,
    total_paid_usd DECIMAL(12, 6) DEFAULT 0,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tier INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clusters table
CREATE TABLE public.clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    max_members INTEGER DEFAULT 10,
    bonus_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cluster_members table
CREATE TABLE public.cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (cluster_id, user_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_usd DECIMAL(12, 6) NOT NULL,
    payout_method payout_method NOT NULL,
    payout_details JSONB NOT NULL,
    status transaction_status DEFAULT 'pending',
    external_tx_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create mining_rewards table for tracking
CREATE TABLE public.mining_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_usd DECIMAL(12, 6) NOT NULL,
    hashrate DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_earnings table
CREATE TABLE public.referral_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    earner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_reward_id UUID REFERENCES public.mining_rewards(id) ON DELETE CASCADE NOT NULL,
    tier INTEGER NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    amount_usd DECIMAL(12, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to generate cluster code
CREATE OR REPLACE FUNCTION public.generate_cluster_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_referral_code TEXT;
    referrer_id UUID;
BEGIN
    -- Generate unique referral code
    LOOP
        new_referral_code := public.generate_referral_code();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code);
    END LOOP;
    
    -- Check if user was referred
    referrer_id := (new.raw_user_meta_data ->> 'referred_by')::UUID;
    
    INSERT INTO public.profiles (user_id, referral_code, referred_by)
    VALUES (new.id, new_referral_code, referrer_id);
    
    -- Create referral records if referred
    IF referrer_id IS NOT NULL THEN
        -- Tier 1 referral
        INSERT INTO public.referrals (inviter_id, invitee_id, tier)
        VALUES (referrer_id, new.id, 1);
        
        -- Check for Tier 2 (inviter's inviter)
        INSERT INTO public.referrals (inviter_id, invitee_id, tier)
        SELECT r.inviter_id, new.id, 2
        FROM public.referrals r
        WHERE r.invitee_id = referrer_id AND r.tier = 1;
    END IF;
    
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update cluster bonus status
CREATE OR REPLACE FUNCTION public.update_cluster_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO member_count
    FROM public.cluster_members
    WHERE cluster_id = COALESCE(NEW.cluster_id, OLD.cluster_id);
    
    UPDATE public.clusters
    SET bonus_active = (member_count >= 5)
    WHERE id = COALESCE(NEW.cluster_id, OLD.cluster_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_cluster_member_change
    AFTER INSERT OR DELETE ON public.cluster_members
    FOR EACH ROW EXECUTE FUNCTION public.update_cluster_bonus();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public profiles viewable for referral lookup"
ON public.profiles FOR SELECT
USING (true);

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- RLS Policies for clusters
CREATE POLICY "Anyone can view clusters"
ON public.clusters FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create clusters"
ON public.clusters FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their clusters"
ON public.clusters FOR UPDATE
USING (auth.uid() = creator_id);

-- RLS Policies for cluster_members
CREATE POLICY "Anyone can view cluster members"
ON public.cluster_members FOR SELECT
USING (true);

CREATE POLICY "Users can join clusters"
ON public.cluster_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clusters"
ON public.cluster_members FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mining_rewards
CREATE POLICY "Users can view their own rewards"
ON public.mining_rewards FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for referral_earnings
CREATE POLICY "Users can view their own referral earnings"
ON public.referral_earnings FOR SELECT
USING (auth.uid() = earner_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admin policies using has_role function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all user_roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user_roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));