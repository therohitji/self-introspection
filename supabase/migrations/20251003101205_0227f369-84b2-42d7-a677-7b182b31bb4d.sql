-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  intention TEXT,
  time_budget INTEGER DEFAULT 20
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create questions table
CREATE TABLE public.questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL UNIQUE
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by authenticated users"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- Create responses table
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) NOT NULL,
  answer_text TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = responses.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own responses"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = responses.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own responses"
  ON public.responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = responses.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Create scores table
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  clarity INTEGER CHECK (clarity >= 1 AND clarity <= 5),
  specificity INTEGER CHECK (specificity >= 1 AND specificity <= 5),
  self_awareness INTEGER CHECK (self_awareness >= 1 AND self_awareness <= 5),
  growth_mindset INTEGER CHECK (growth_mindset >= 1 AND growth_mindset <= 5),
  consistency INTEGER CHECK (consistency >= 1 AND consistency <= 5),
  tags TEXT[] DEFAULT '{}',
  contradictions TEXT[] DEFAULT '{}',
  red_flags TEXT[] DEFAULT '{}',
  why_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for their responses"
  ON public.scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.sessions ON sessions.id = responses.session_id
      WHERE responses.id = scores.response_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert scores"
  ON public.scores FOR INSERT
  WITH CHECK (true);

-- Create rollups table
CREATE TABLE public.rollups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  clarity DECIMAL(3,2),
  specificity DECIMAL(3,2),
  self_awareness DECIMAL(3,2),
  growth_mindset DECIMAL(3,2),
  consistency DECIMAL(3,2),
  highlights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rollups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rollups"
  ON public.rollups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = rollups.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert rollups"
  ON public.rollups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rollups"
  ON public.rollups FOR UPDATE
  USING (true);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content_md TEXT,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create events table for analytics
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON public.responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rollups_updated_at
  BEFORE UPDATE ON public.rollups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Seed questions data
INSERT INTO public.questions (id, text, type, tags, order_index) VALUES
  ('q1', 'What is the definition of success in your life?', 'long_text', ARRAY['identity','success'], 1),
  ('q2', 'What is your true potential?', 'long_text', ARRAY['potential'], 2),
  ('q3', 'What is your true worth?', 'long_text', ARRAY['self-worth'], 3),
  ('q4', 'Who inspires you the most?', 'long_text', ARRAY['role-models'], 4),
  ('q5', 'Who are you at present, what you want to become in future and why so?', 'long_text', ARRAY['identity','future'], 5),
  ('q6', 'What impact you want to create in society or world and why?', 'long_text', ARRAY['impact'], 6),
  ('q7', 'In your perspective, why do people choose the rat race?', 'long_text', ARRAY['society','motivation'], 7),
  ('q8', 'Why do you want to make efforts instead of enjoying like others?', 'long_text', ARRAY['discipline'], 8),
  ('q9', 'Why are you special?', 'long_text', ARRAY['strengths'], 9),
  ('q10', 'In your perspective, why are billionaires highly successful?', 'long_text', ARRAY['success','models'], 10),
  ('q11', 'What is your limit and how will you become your best version?', 'long_text', ARRAY['limits','growth'], 11),
  ('q12', 'Why do you want to hustle or make efforts, although everything is going perfectly?', 'long_text', ARRAY['complacency'], 12),
  ('q13', 'What are your biggest fears or concerns?', 'long_text', ARRAY['fears'], 13),
  ('q14', 'What is your comfort zone and why do you want to leave it?', 'long_text', ARRAY['comfort-zone'], 14),
  ('q15', 'Are you your best version now, if not then how will you be in your best version?', 'long_text', ARRAY['self-assessment'], 15),
  ('q16', 'What does your ideal lifestyle or career look like?', 'long_text', ARRAY['vision'], 16),
  ('q17', 'In your perspective, why do people want to become their best version?', 'long_text', ARRAY['motivation'], 17),
  ('q18', 'What special will happen if you start hustling and stepping out of your comfort zone?', 'long_text', ARRAY['delta'], 18),
  ('q19', 'What possibilities and opportunities are you missing out with your current personality and why?', 'long_text', ARRAY['opportunity-cost'], 19),
  ('q20', 'What is holding yourself back from taking risks, trying new things, finding your best version?', 'long_text', ARRAY['barriers'], 20),
  ('q21', 'Why do people want to become better than others... why is everyone running into a race?', 'long_text', ARRAY['competition'], 21),
  ('q22', 'What is failure from your point of view?', 'long_text', ARRAY['failure'], 22),
  ('q23', 'Who are successful and how did they achieve so?', 'long_text', ARRAY['models','strategy'], 23),
  ('q24', 'Nature of survival in the jungle... analogy for humans?', 'long_text', ARRAY['analogy','survival'], 24),
  ('q25', 'What is your biggest regret and why?', 'long_text', ARRAY['regret'], 25),
  ('q26', 'What should someone do if they have fear of failures?', 'long_text', ARRAY['coping'], 26),
  ('q27', 'What are the three things which you mostly like to do?', 'long_text', ARRAY['interests'], 27),
  ('q28', 'What skills and qualities do you want to include and why?', 'long_text', ARRAY['skills'], 28),
  ('q29', 'How do you want to identify yourself in different contexts?', 'long_text', ARRAY['identity','context'], 29),
  ('q30', 'How do you make your decisions and why so?', 'long_text', ARRAY['decision-making'], 30),
  ('q31', 'What work can you do for long without getting tired?', 'long_text', ARRAY['flow'], 31),
  ('q32', 'Why do some people choose to struggle and others not?', 'long_text', ARRAY['mindset'], 32),
  ('q33', 'Why does someone become special and someone becomes no one... who would you choose to be and why?', 'long_text', ARRAY['aspiration'], 33),
  ('q34', 'What motivates you the most and for what?', 'long_text', ARRAY['motivation'], 34),
  ('q35', 'Why do people choose to become self disciplined instead of enjoying their life?', 'long_text', ARRAY['discipline','hedonics'], 35),
  ('q36', 'Differentiate mindsets (ordinary, extraordinary, harmful, loving, etc.) — who is bad and why? How should we become?', 'long_text', ARRAY['ethics','mindset'], 36),
  ('q37', 'Why are Shah Rukh Khan, MS Dhoni, Sachin, Ronaldo/Messi, Alakh Pandey revered?', 'long_text', ARRAY['excellence'], 37),
  ('q38', 'What kind of legacy do you want to leave behind in this fast-growing world?', 'long_text', ARRAY['legacy'], 38),
  ('q39', 'Why can''t we live like animals — eat, sleep, repeat?', 'long_text', ARRAY['meaning'], 39),
  ('q40', 'Which horse is more valuable: load carrier vs race winner — and why?', 'long_text', ARRAY['value','analogy'], 40),
  ('q41', 'Which type of mentor do you want to become for your youngsters — and why?', 'long_text', ARRAY['mentor'], 41),
  ('q42', 'What self-limiting beliefs are stopping you and why?', 'long_text', ARRAY['beliefs'], 42),
  ('q43', 'What potential opportunities are missed by staying in your comfort zone?', 'long_text', ARRAY['opportunity-cost'], 43),
  ('q44', 'What motivates a hustler during the journey?', 'long_text', ARRAY['motivation','grit'], 44),
  ('q45', 'Activity: List five things you could possibly become if you work extremely well.', 'activity', ARRAY['vision','activity'], 45),
  ('q46', 'How will you handle demotivation, frustrations, self doubts, fear of failures?', 'long_text', ARRAY['coping-plan'], 46),
  ('q47', 'Do you believe hard work guarantees results? If yes, what fears remain and why?', 'long_text', ARRAY['beliefs','risk'], 47),
  ('q48', 'Activity: Watch ''Connecting the Dots'' by Steve Jobs — what does it mean to you?', 'activity', ARRAY['reflection','activity'], 48),
  ('q49', 'Activity: 25 Goals -> narrow to 1. Outline skills, strategies, timelines, risks, outcomes.', 'activity', ARRAY['prioritization','planning'], 49),
  ('q50', 'Now, what is your potential and how will you make your worth?', 'long_text', ARRAY['summary'], 50);