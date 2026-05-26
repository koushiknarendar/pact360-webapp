import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDaysRemaining(deadline: string | Date): number {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getHoursRemaining(deadline: string | Date): number {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60))
}

export function complianceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    at_risk: 'At Risk',
    compliant: 'Compliant',
    non_compliant: 'Non-Compliant',
  }
  return labels[status] ?? status
}

export function requestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    access: 'Data Access',
    correction: 'Data Correction',
    erasure: 'Data Erasure',
    grievance: 'Grievance',
    nomination: 'Nomination',
    withdrawal_of_consent: 'Consent Withdrawal',
  }
  return labels[type] ?? type
}

export function requestStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    acknowledged: 'Acknowledged',
    in_review: 'In Review',
    resolved: 'Resolved',
    rejected: 'Rejected',
    escalated: 'Escalated',
  }
  return labels[status] ?? status
}

export function breachStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    detected: 'Detected',
    contained: 'Contained',
    notified_dpb: 'DPB Notified',
    notified_principals: 'Principals Notified',
    closed: 'Closed',
  }
  return labels[status] ?? status
}

export function severityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  }
  return colors[severity] ?? 'text-gray-400'
}

export function complianceScoreColor(score: number): string {
  if (score < 50) return 'text-red-400'
  if (score < 76) return 'text-yellow-400'
  return 'text-teal-400'
}
