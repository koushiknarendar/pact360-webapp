-- ============================================================
-- PACT360 — Initial Schema Migration
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('fiduciary', 'dpo', 'admin');
CREATE TYPE org_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');
CREATE TYPE org_sector AS ENUM ('fintech', 'healthtech', 'edtech', 'ecommerce', 'saas', 'media', 'telecom', 'banking', 'insurance', 'other');
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'business', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due', 'cancelled');
CREATE TYPE dpo_status AS ENUM ('pending', 'approved', 'inactive');
CREATE TYPE compliance_status AS ENUM ('not_started', 'in_progress', 'compliant', 'at_risk', 'non_compliant');
CREATE TYPE request_type AS ENUM ('access', 'correction', 'erasure', 'grievance', 'nomination', 'withdrawal_of_consent');
CREATE TYPE request_status AS ENUM ('submitted', 'acknowledged', 'in_review', 'resolved', 'rejected', 'escalated');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE breach_status AS ENUM ('detected', 'contained', 'notified_dpb', 'notified_principals', 'closed');
CREATE TYPE consent_status AS ENUM ('active', 'withdrawn', 'expired');
CREATE TYPE training_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE notice_status AS ENUM ('draft', 'active', 'archived');

-- PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'fiduciary',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANISATIONS
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry org_sector NOT NULL DEFAULT 'other',
  size org_size NOT NULL,
  website TEXT,
  gstin TEXT,
  cin TEXT,
  pan TEXT,
  registered_address TEXT,
  grievance_officer_name TEXT,
  grievance_officer_email TEXT,
  grievance_officer_phone TEXT,
  is_significant_data_fiduciary BOOLEAN DEFAULT FALSE,
  compliance_status compliance_status DEFAULT 'not_started',
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
  public_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  slug TEXT UNIQUE,
  subscription_plan subscription_plan DEFAULT 'starter',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DPOS
CREATE TABLE dpos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  qualification TEXT,
  experience_years INTEGER,
  sectors org_sector[],
  certifications TEXT[],
  rating NUMERIC(3,2) DEFAULT 0,
  cases_handled INTEGER DEFAULT 0,
  availability BOOLEAN DEFAULT TRUE,
  status dpo_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATA PRINCIPAL REQUESTS
CREATE TABLE data_principal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  request_number TEXT UNIQUE,
  request_type request_type NOT NULL,
  status request_status DEFAULT 'submitted',
  priority request_priority DEFAULT 'medium',
  principal_name TEXT NOT NULL,
  principal_email TEXT,
  principal_phone TEXT,
  principal_id_type TEXT,
  principal_id_last4 TEXT,
  description TEXT NOT NULL,
  data_categories TEXT[],
  purpose_reference TEXT,
  assigned_dpo_id UUID REFERENCES dpos(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate request numbers
CREATE SEQUENCE request_number_seq;
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'DPDP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('request_number_seq')::TEXT, 4, '0');
  NEW.deadline_at := NOW() + INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON data_principal_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION generate_request_number();

-- CONSENTS
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  principal_email TEXT,
  principal_phone TEXT,
  purpose TEXT NOT NULL,
  purpose_description TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  lawful_basis TEXT NOT NULL DEFAULT 'consent',
  consent_text TEXT NOT NULL,
  status consent_status DEFAULT 'active',
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  consent_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRIVACY NOTICES
CREATE TABLE privacy_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status notice_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATA BREACHES
CREATE TABLE data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  breach_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity breach_severity NOT NULL DEFAULT 'medium',
  status breach_status DEFAULT 'detected',
  detected_at TIMESTAMPTZ NOT NULL,
  contained_at TIMESTAMPTZ,
  data_categories_affected TEXT[],
  estimated_principals_affected INTEGER,
  dpb_notification_deadline TIMESTAMPTZ,
  dpb_notified_at TIMESTAMPTZ,
  principals_notification_deadline TIMESTAMPTZ,
  principals_notified_at TIMESTAMPTZ,
  root_cause TEXT,
  remediation_steps TEXT,
  assigned_dpo_id UUID REFERENCES dpos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate breach numbers and deadlines
CREATE SEQUENCE breach_number_seq;
CREATE OR REPLACE FUNCTION generate_breach_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.breach_number := 'BREACH-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('breach_number_seq')::TEXT, 4, '0');
  NEW.dpb_notification_deadline := NEW.detected_at + INTERVAL '72 hours';
  NEW.principals_notification_deadline := NEW.detected_at + INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_breach_number
  BEFORE INSERT ON data_breaches
  FOR EACH ROW
  WHEN (NEW.breach_number IS NULL)
  EXECUTE FUNCTION generate_breach_number();

-- PROCESSING ACTIVITIES (RoPA)
CREATE TABLE processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  lawful_basis TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  data_subjects TEXT[] NOT NULL,
  involves_children BOOLEAN DEFAULT FALSE,
  retention_period TEXT NOT NULL,
  processors TEXT[],
  cross_border_transfer BOOLEAN DEFAULT FALSE,
  transfer_countries TEXT[],
  security_measures TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING SESSIONS
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  conducted_at TIMESTAMPTZ,
  mode TEXT DEFAULT 'online',
  status training_status DEFAULT 'pending',
  public_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING COMPLETIONS
CREATE TABLE training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING MODULES
CREATE TABLE training_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  xp_reward INTEGER DEFAULT 100,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODULE COMPLETIONS
CREATE TABLE module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES training_modules(id),
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  status subscription_status DEFAULT 'active',
  cashfree_order_id TEXT,
  amount_paise INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  is_founding_member BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEMO REQUESTS
CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  cashfree_order_id TEXT,
  plan subscription_plan,
  status TEXT DEFAULT 'lead',
  provisioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Training Modules
-- ============================================================
INSERT INTO training_modules (id, title, description, duration_minutes, xp_reward, order_index) VALUES
('module-1', 'Introduction to DPDP Act 2023', 'Understand India''s landmark data protection law — what it covers, why it matters, and what your organisation must do.', 15, 100, 1),
('module-2', 'What is Personal Data?', 'Learn to identify personal data, sensitive data, and special categories — including children''s data, health records, and biometrics.', 12, 100, 2),
('module-3', 'Rights of Data Principals', 'Understand what rights individuals have over their data: access, correction, erasure, grievance, and nomination.', 15, 100, 3),
('module-4', 'Lawful Data Processing', 'Learn how consent works, what legitimate use means, and the rules around purpose limitation, data minimisation, and retention.', 15, 100, 4),
('module-5', 'Keeping Data Safe', 'Security safeguards, breach response obligations, and your personal responsibilities as an employee handling personal data.', 12, 100, 5);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_principal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Organisations (fiduciary sees their own)
CREATE POLICY "Fiduciary reads own org" ON organisations FOR SELECT
  USING (owner_id = auth.uid());
CREATE POLICY "Fiduciary updates own org" ON organisations FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY "Fiduciary inserts org" ON organisations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- DPOs (approved DPOs visible to all authenticated users)
CREATE POLICY "Authenticated users view approved dpos" ON dpos FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'approved');
CREATE POLICY "DPO manages own profile" ON dpos FOR ALL
  USING (profile_id = auth.uid());

-- Data Principal Requests
CREATE POLICY "Fiduciary sees org requests" ON data_principal_requests FOR SELECT
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));
CREATE POLICY "Fiduciary manages org requests" ON data_principal_requests FOR UPDATE
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));
CREATE POLICY "Public can submit requests" ON data_principal_requests FOR INSERT
  WITH CHECK (TRUE);

-- Consents
CREATE POLICY "Fiduciary sees org consents" ON consents FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Privacy Notices
CREATE POLICY "Fiduciary manages notices" ON privacy_notices FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));
CREATE POLICY "Public reads active notices" ON privacy_notices FOR SELECT
  USING (status = 'active');

-- Data Breaches
CREATE POLICY "Fiduciary sees org breaches" ON data_breaches FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Processing Activities
CREATE POLICY "Fiduciary manages activities" ON processing_activities FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Training Sessions
CREATE POLICY "Fiduciary manages training sessions" ON training_sessions FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Training Completions
CREATE POLICY "Fiduciary views completions" ON training_completions FOR SELECT
  USING (training_session_id IN (
    SELECT id FROM training_sessions
    WHERE org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid())
  ));
CREATE POLICY "Public can insert completions" ON training_completions FOR INSERT
  WITH CHECK (TRUE);

-- Training Modules (public read)
CREATE POLICY "Anyone reads modules" ON training_modules FOR SELECT USING (TRUE);

-- Module Completions
CREATE POLICY "Fiduciary views module completions" ON module_completions FOR SELECT
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));
CREATE POLICY "Public inserts module completions" ON module_completions FOR INSERT
  WITH CHECK (TRUE);

-- Documents
CREATE POLICY "Fiduciary manages documents" ON documents FOR ALL
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Subscriptions
CREATE POLICY "Fiduciary views own subscription" ON subscriptions FOR SELECT
  USING (org_id IN (SELECT id FROM organisations WHERE owner_id = auth.uid()));

-- Demo Requests (service role only — no user-facing RLS needed)
CREATE POLICY "Service role manages demo requests" ON demo_requests FOR ALL
  USING (TRUE);

-- Notifications
CREATE POLICY "Users see own notifications" ON notifications FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organisations_updated_at BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER dpos_updated_at BEFORE UPDATE ON dpos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON data_principal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER consents_updated_at BEFORE UPDATE ON consents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER notices_updated_at BEFORE UPDATE ON privacy_notices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER breaches_updated_at BEFORE UPDATE ON data_breaches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON processing_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'fiduciary'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
