import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@pact360.in'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.pact360.in'

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0F14;font-family:Inter,sans-serif;">
<div style="max-width:600px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;">PACT360</span>
    <span style="font-size:11px;color:#71717a;margin-left:8px;">India's Privacy Compliance OS</span>
  </div>
  <div style="background:#18181b;border-radius:12px;padding:32px;border:1px solid #27272a;">
    ${content}
  </div>
  <p style="color:#52525b;font-size:11px;text-align:center;margin-top:24px;">
    Pact360 · Advocare Technologies Private Limited<br>
    <a href="${APP_URL}" style="color:#2A9D8F;text-decoration:none;">${APP_URL}</a>
  </p>
</div>
</body>
</html>`
}

const h1 = (text: string) =>
  `<h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px 0;">${text}</h1>`

const p = (text: string) =>
  `<p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 16px 0;">${text}</p>`

const button = (text: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:#C23B22;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-top:8px;">${text}</a>`

const divider = () =>
  `<hr style="border:none;border-top:1px solid #27272a;margin:24px 0;">`

const badge = (text: string, color = '#2A9D8F') =>
  `<span style="display:inline-block;background:${color}20;color:${color};border:1px solid ${color}40;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">${text}</span>`

// ─── Welcome: Fiduciary ─────────────────────────────────────────────────────

export async function sendFiduciaryWelcome(opts: {
  email: string
  name: string
  orgName: string
  loginUrl: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.email,
    subject: `Welcome to PACT360 — ${opts.orgName}`,
    html: baseHtml(`
      ${h1('Your DPDP compliance workspace is ready.')}
      ${p(`Hi ${opts.name},`)}
      ${p(`${opts.orgName}'s PACT360 account has been created. You can now set up your privacy notice, add processing activities, and start tracking Data Principal requests.`)}
      ${p('Set your password and complete onboarding to get your first PACT Score.')}
      ${button('Set up your account', opts.loginUrl)}
      ${divider()}
      ${p('<strong style="color:#fff;">What to do first:</strong><br>1. Set your password using the link above<br>2. Add your Grievance Officer details<br>3. Generate your privacy notice with AI<br>4. Share your rights request portal with customers')}
    `),
  })
}

// ─── Welcome: DPO ───────────────────────────────────────────────────────────

export async function sendDpoWelcome(opts: {
  email: string
  name: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.email,
    subject: 'Welcome to the PACT360 DPO Network',
    html: baseHtml(`
      ${h1('Welcome to the Pact360 DPO Network.')}
      ${p(`Hi ${opts.name},`)}
      ${p('Your DPO profile has been submitted and is under review by our team. Once approved, you\'ll be listed in the DPO directory and can be assigned to rights requests and breach cases.')}
      ${p('We typically review profiles within 2 business days.')}
      ${button('View your profile', `${APP_URL}/dpo/setup`)}
    `),
  })
}

// ─── New Rights Request ──────────────────────────────────────────────────────

export async function sendNewRequestNotification(opts: {
  grievanceOfficerEmail: string
  orgName: string
  requestNumber: string
  requestType: string
  principalName: string
  deadlineDays: number
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.grievanceOfficerEmail,
    subject: `New rights request: ${opts.requestNumber}`,
    html: baseHtml(`
      ${h1(`New rights request received.`)}
      ${p(`${opts.orgName} has received a new Data Principal rights request.`)}
      <table style="width:100%;margin-bottom:16px;">
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Reference</td><td style="color:#fff;font-size:13px;">${opts.requestNumber}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Type</td><td style="color:#fff;font-size:13px;">${opts.requestType}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">From</td><td style="color:#fff;font-size:13px;">${opts.principalName}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Deadline</td><td style="color:#C23B22;font-size:13px;font-weight:600;">${opts.deadlineDays} days</td></tr>
      </table>
      ${p('You must acknowledge and respond within 30 days under the DPDP Act.')}
      ${button('View and manage request', `${APP_URL}/fiduciary/requests`)}
    `),
  })
}

// ─── Request Acknowledged ────────────────────────────────────────────────────

export async function sendRequestAcknowledged(opts: {
  principalEmail: string
  principalName: string
  requestNumber: string
  orgName: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.principalEmail,
    subject: `We've received your request — ${opts.requestNumber}`,
    html: baseHtml(`
      ${h1("We've received your request.")}
      ${p(`Dear ${opts.principalName},`)}
      ${p(`${opts.orgName} has received your data rights request and it is now under review.`)}
      <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#71717a;font-size:12px;margin:0 0 4px 0;">Your reference number</p>
        <p style="color:#2A9D8F;font-size:20px;font-family:monospace;font-weight:700;margin:0;">${opts.requestNumber}</p>
      </div>
      ${p('Under the Digital Personal Data Protection Act, 2023, we are required to respond within 30 days. We will update you when your request is resolved.')}
      ${p('If you have questions, contact the Grievance Officer of ' + opts.orgName + '.')}
    `),
  })
}

// ─── Request Resolved ────────────────────────────────────────────────────────

export async function sendRequestResolved(opts: {
  principalEmail: string
  principalName: string
  requestNumber: string
  orgName: string
  resolutionNotes: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.principalEmail,
    subject: `Your request has been resolved — ${opts.requestNumber}`,
    html: baseHtml(`
      ${h1('Your request has been resolved.')}
      ${p(`Dear ${opts.principalName},`)}
      ${p(`${opts.orgName} has resolved your data rights request.`)}
      <div style="background:#18181b;border:1px solid #2A9D840;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#71717a;font-size:12px;margin:0 0 8px 0;">Reference: ${opts.requestNumber}</p>
        <p style="color:#a1a1aa;font-size:13px;margin:0;">${opts.resolutionNotes}</p>
      </div>
      ${p('If you are not satisfied with the resolution, you may escalate to the Data Protection Board of India.')}
    `),
  })
}

// ─── Request Overdue (21 days) ────────────────────────────────────────────────

export async function sendRequestOverdueAlert(opts: {
  grievanceOfficerEmail: string
  orgName: string
  requestNumber: string
  daysElapsed: number
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.grievanceOfficerEmail,
    subject: `Action required: rights request overdue — ${opts.requestNumber}`,
    html: baseHtml(`
      ${h1('Action required: rights request overdue.')}
      ${badge('ESCALATION RISK', '#C23B22')}
      <br><br>
      ${p(`Request ${opts.requestNumber} for ${opts.orgName} has been open for ${opts.daysElapsed} days without resolution.`)}
      ${p('Under the DPDP Act, you must respond within 30 days. With only a few days remaining, this request is at risk of non-compliance.')}
      ${button('Resolve now', `${APP_URL}/fiduciary/requests`)}
    `),
  })
}

// ─── Breach Detected ─────────────────────────────────────────────────────────

export async function sendBreachAlert(opts: {
  adminEmail: string
  orgName: string
  breachNumber: string
  breachTitle: string
  severity: string
  dpbDeadline: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.adminEmail,
    subject: `[URGENT] Data breach reported — ${opts.breachNumber}`,
    html: baseHtml(`
      ${h1('[URGENT] Data breach reported.')}
      ${badge('72-HOUR DPB CLOCK STARTED', '#C23B22')}
      <br><br>
      ${p(`A data breach has been reported for ${opts.orgName}.`)}
      <table style="width:100%;margin-bottom:16px;">
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Reference</td><td style="color:#fff;font-size:13px;">${opts.breachNumber}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Title</td><td style="color:#fff;font-size:13px;">${opts.breachTitle}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Severity</td><td style="color:#C23B22;font-size:13px;font-weight:600;">${opts.severity.toUpperCase()}</td></tr>
        <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">DPB deadline</td><td style="color:#C23B22;font-size:13px;font-weight:600;">${opts.dpbDeadline}</td></tr>
      </table>
      ${p('The Data Protection Board must be notified within 72 hours of detection.')}
      ${button('Manage breach now', `${APP_URL}/fiduciary/breaches`)}
    `),
  })
}

// ─── Breach DPB Deadline Approaching ─────────────────────────────────────────

export async function sendBreachDpbDeadlineWarning(opts: {
  adminEmail: string
  orgName: string
  breachNumber: string
  hoursRemaining: number
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.adminEmail,
    subject: `DPB notification due in ${opts.hoursRemaining} hours — ${opts.breachNumber}`,
    html: baseHtml(`
      ${h1(`DPB notification due in ${opts.hoursRemaining} hours.`)}
      ${badge('URGENT', '#C23B22')}
      <br><br>
      ${p(`The 72-hour DPB notification window for breach ${opts.breachNumber} (${opts.orgName}) closes in ${opts.hoursRemaining} hours.`)}
      ${p('Use the AI breach report drafter to prepare your notification, then file with the Data Protection Board immediately.')}
      ${button('Draft DPB notification', `${APP_URL}/fiduciary/breaches`)}
    `),
  })
}

// ─── Training Link ────────────────────────────────────────────────────────────

export async function sendTrainingLink(opts: {
  employeeEmail: string
  employeeName: string
  orgName: string
  trainingUrl: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.employeeEmail,
    subject: `Your DPDP awareness training from ${opts.orgName}`,
    html: baseHtml(`
      ${h1('Your DPDP training awaits.')}
      ${p(`Hi ${opts.employeeName},`)}
      ${p(`${opts.orgName} has asked you to complete DPDP (Digital Personal Data Protection Act) awareness training. It takes about 65 minutes and covers India's new data protection law.`)}
      <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px 0;"><strong style="color:#fff;">5 modules</strong> · 65 minutes · Certificate on completion</p>
        <p style="color:#71717a;font-size:12px;margin:0;">No login required. Complete at your own pace.</p>
      </div>
      ${button('Start training', opts.trainingUrl)}
      ${p('<span style="color:#71717a;font-size:12px;">This link is unique to you. Do not share it with others.</span>')}
    `),
  })
}

// ─── Training Completed ───────────────────────────────────────────────────────

export async function sendTrainingCompleted(opts: {
  adminEmail: string
  orgName: string
  employeeName: string
  employeeEmail: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.adminEmail,
    subject: `${opts.employeeName} completed DPDP training`,
    html: baseHtml(`
      ${h1(`${opts.employeeName} completed DPDP training.`)}
      ${badge('TRAINING COMPLETE', '#2A9D8F')}
      <br><br>
      ${p(`${opts.employeeName} (${opts.employeeEmail}) has successfully completed all 5 DPDP awareness modules for ${opts.orgName}.`)}
      ${p('Their completion has been recorded and their certificate is available for download.')}
      ${button('View training records', `${APP_URL}/fiduciary/training`)}
    `),
  })
}

// ─── Compliance Score Drop ────────────────────────────────────────────────────

export async function sendComplianceScoreDrop(opts: {
  adminEmail: string
  orgName: string
  score: number
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.adminEmail,
    subject: `Your DPDP compliance needs attention — PACT Score: ${opts.score}`,
    html: baseHtml(`
      ${h1('Your DPDP compliance needs attention.')}
      ${badge(`PACT SCORE: ${opts.score}/100`, '#C23B22')}
      <br><br>
      ${p(`${opts.orgName}'s PACT Score has dropped below 50. This indicates compliance gaps that could expose your organisation to regulatory risk.`)}
      ${p('Log in to your dashboard to see exactly what needs attention and use the compliance checklist to improve your score.')}
      ${button('View compliance dashboard', `${APP_URL}/fiduciary`)}
    `),
  })
}
