import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generatePrivacyNotice(orgProfile: Record<string, unknown>, activities: Record<string, unknown>[]): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Generate a DPDP Act 2023 compliant privacy notice for this Indian organisation.

Organisation: ${JSON.stringify(orgProfile, null, 2)}
Processing Activities: ${JSON.stringify(activities, null, 2)}

Write a complete, plain-language privacy notice that covers:
1. Identity and contact details of the Data Fiduciary
2. Categories of personal data collected
3. Purposes of processing for each category
4. Lawful basis (consent or legitimate use)
5. Retention periods
6. Data Principal rights (access, correction, erasure, grievance, nomination)
7. How to contact the Grievance Officer
8. Third-party processors and cross-border transfers (if applicable)
9. Children's data handling (if applicable)
10. How to withdraw consent

Cite relevant DPDP Act sections. Write in clear English accessible to any Indian citizen. Do not use legal jargon without explanation.`
    }],
  })

  return (message.content[0] as { type: string; text: string }).text
}

export async function analyzeRequestRisk(request: Record<string, unknown>): Promise<{
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendedActions: string[]
  estimatedComplexity: string
  flagged_issues: string[]
}> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyze this DPDP rights request for risk and complexity. Return a JSON object only.

Request: ${JSON.stringify(request, null, 2)}

Return JSON: { "riskLevel": "low|medium|high|critical", "recommendedActions": ["step1", "step2"], "estimatedComplexity": "simple|moderate|complex", "flagged_issues": ["issue1"] }

Consider: data erasure of children = critical; broad access requests = high; consent withdrawal = medium.`
    }],
  })

  const text = (message.content[0] as { type: string; text: string }).text
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
}

export async function draftBreachReport(breach: Record<string, unknown>): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Draft a Data Protection Board (DPB) breach notification report under the DPDP Act 2023.

Breach details: ${JSON.stringify(breach, null, 2)}

Structure the report with:
1. Incident Reference Number
2. Nature of the breach (what happened)
3. Categories and approximate number of personal data records concerned
4. Likely consequences of the breach
5. Measures taken or proposed to address the breach
6. Contact details for further information

This will be submitted to the DPB. Be factual, precise, and avoid speculation. Note any information that is not yet available.`
    }],
  })

  return (message.content[0] as { type: string; text: string }).text
}

export async function answerDPDPQuestion(question: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Answer this question about India's Digital Personal Data Protection Act, 2023.

Question: ${question}

Rules:
- Cite specific DPDP Act sections where relevant (e.g. "Section 6(1)")
- Be accurate — do not speculate about provisions that are not yet notified
- Translate legal language into plain English
- If the Rules have not yet been finalised, say so clearly
- Focus on practical implications for Indian organisations

Provide a clear, structured answer.`
    }],
  })

  return (message.content[0] as { type: string; text: string }).text
}

export async function generateConsentText(purpose: string, dataCategories: string[], orgName: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Write a clear, plain-language consent notice for collection of personal data, compliant with DPDP Act 2023.

Organisation: ${orgName}
Purpose: ${purpose}
Data categories: ${dataCategories.join(', ')}

Requirements (DPDP Act Section 5):
- State the specific purpose clearly
- List exactly what data will be collected
- Explain how it will be used
- State how long it will be retained
- Explain how consent can be withdrawn
- State that providing consent is voluntary

Write in plain English that any adult Indian citizen can understand. Maximum 200 words.`
    }],
  })

  return (message.content[0] as { type: string; text: string }).text
}

export async function dpiaGuidance(activity: Record<string, unknown>): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Conduct a Data Protection Impact Assessment (DPIA) for this processing activity under the DPDP Act 2023.

Activity: ${JSON.stringify(activity, null, 2)}

Provide:
1. Risk assessment (privacy risks and their likelihood/severity)
2. Whether this activity involves high-risk processing (children's data, biometrics, financial data, large-scale processing)
3. Recommended safeguards and security measures
4. Whether DPO consultation is recommended
5. Checklist of compliance requirements for this activity

Reference relevant DPDP Act obligations including Section 17 for Significant Data Fiduciaries if applicable.`
    }],
  })

  return (message.content[0] as { type: string; text: string }).text
}
