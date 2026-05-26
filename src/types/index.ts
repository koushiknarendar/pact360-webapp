export type UserRole = 'fiduciary' | 'dpo' | 'admin'
export type OrgSize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'
export type OrgSector = 'fintech' | 'healthtech' | 'edtech' | 'ecommerce' | 'saas' | 'media' | 'telecom' | 'banking' | 'insurance' | 'other'
export type SubscriptionPlan = 'starter' | 'growth' | 'business' | 'enterprise'
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled'
export type DpoStatus = 'pending' | 'approved' | 'inactive'
export type ComplianceStatus = 'not_started' | 'in_progress' | 'at_risk' | 'compliant' | 'non_compliant'
export type RequestType = 'access' | 'correction' | 'erasure' | 'grievance' | 'nomination' | 'withdrawal_of_consent'
export type RequestStatus = 'submitted' | 'acknowledged' | 'in_review' | 'resolved' | 'rejected' | 'escalated'
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical'
export type BreachSeverity = 'low' | 'medium' | 'high' | 'critical'
export type BreachStatus = 'detected' | 'contained' | 'notified_dpb' | 'notified_principals' | 'closed'
export type ConsentStatus = 'active' | 'withdrawn' | 'expired'
export type TrainingStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type NoticeStatus = 'draft' | 'active' | 'archived'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Organisation {
  id: string
  owner_id: string
  name: string
  industry: OrgSector
  size: OrgSize
  website?: string
  gstin?: string
  cin?: string
  pan?: string
  registered_address?: string
  grievance_officer_name?: string
  grievance_officer_email?: string
  grievance_officer_phone?: string
  is_significant_data_fiduciary: boolean
  compliance_status: ComplianceStatus
  compliance_score: number
  public_token: string
  slug?: string
  subscription_plan: SubscriptionPlan
  onboarded_at?: string
  created_at: string
  updated_at: string
}

export interface Dpo {
  id: string
  profile_id: string
  bio?: string
  qualification?: string
  experience_years?: number
  sectors?: OrgSector[]
  certifications?: string[]
  rating: number
  cases_handled: number
  availability: boolean
  status: DpoStatus
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface DataPrincipalRequest {
  id: string
  org_id: string
  request_number?: string
  request_type: RequestType
  status: RequestStatus
  priority: RequestPriority
  principal_name: string
  principal_email?: string
  principal_phone?: string
  principal_id_type?: string
  principal_id_last4?: string
  description: string
  data_categories?: string[]
  purpose_reference?: string
  assigned_dpo_id?: string
  resolution_notes?: string
  resolved_at?: string
  deadline_at?: string
  submitted_at: string
  acknowledged_at?: string
  created_at: string
  updated_at: string
}

export interface Consent {
  id: string
  org_id: string
  principal_email?: string
  principal_phone?: string
  purpose: string
  purpose_description: string
  data_categories: string[]
  lawful_basis: string
  consent_text: string
  status: ConsentStatus
  consented_at?: string
  withdrawn_at?: string
  expires_at?: string
  consent_proof_url?: string
  created_at: string
  updated_at: string
}

export interface PrivacyNotice {
  id: string
  org_id: string
  version: string
  title: string
  content: string
  status: NoticeStatus
  published_at?: string
  archived_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface DataBreach {
  id: string
  org_id: string
  breach_number?: string
  title: string
  description: string
  severity: BreachSeverity
  status: BreachStatus
  detected_at: string
  contained_at?: string
  data_categories_affected?: string[]
  estimated_principals_affected?: number
  dpb_notification_deadline?: string
  dpb_notified_at?: string
  principals_notification_deadline?: string
  principals_notified_at?: string
  root_cause?: string
  remediation_steps?: string
  assigned_dpo_id?: string
  created_at: string
  updated_at: string
}

export interface ProcessingActivity {
  id: string
  org_id: string
  name: string
  purpose: string
  lawful_basis: string
  data_categories: string[]
  data_subjects: string[]
  involves_children: boolean
  retention_period: string
  processors?: string[]
  cross_border_transfer: boolean
  transfer_countries?: string[]
  security_measures?: string[]
  is_active: boolean
  last_reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface TrainingSession {
  id: string
  org_id: string
  title: string
  scheduled_at?: string
  conducted_at?: string
  mode: string
  status: TrainingStatus
  public_token: string
  created_at: string
}

export interface TrainingCompletion {
  id: string
  training_session_id: string
  employee_name: string
  employee_email: string
  completed_at?: string
  certificate_url?: string
  created_at: string
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  duration_minutes: number
  xp_reward: number
  order_index: number
  created_at: string
}

export interface ModuleCompletion {
  id: string
  org_id: string
  module_id: string
  participant_name: string
  participant_email: string
  score: number
  xp_earned: number
  completed_at: string
}

export interface Subscription {
  id: string
  org_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  cashfree_order_id?: string
  amount_paise?: number
  current_period_start?: string
  current_period_end?: string
  is_founding_member: boolean
  created_at: string
  updated_at: string
}

export interface DemoRequest {
  id: string
  contact_name: string
  email: string
  company_name: string
  phone?: string
  cashfree_order_id?: string
  plan?: SubscriptionPlan
  status: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  link?: string
  created_at: string
}
