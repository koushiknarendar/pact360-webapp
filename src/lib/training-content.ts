export type SlideType = 'intro' | 'info' | 'scenario' | 'quiz'

export interface QuizOption {
  text: string
  correct: boolean
}

export interface Slide {
  id: string
  type: SlideType
  title: string
  content: string
  options?: QuizOption[]
  explanation?: string
}

export interface TrainingModuleContent {
  id: string
  title: string
  description: string
  slides: Slide[]
  xpReward: number
}

export const TRAINING_MODULES: TrainingModuleContent[] = [
  {
    id: 'module-1',
    title: 'Introduction to DPDP Act 2023',
    description: 'Understand India\'s landmark data protection law — what it covers, why it matters, and what your organisation must do.',
    xpReward: 100,
    slides: [
      {
        id: 'm1-s1',
        type: 'intro',
        title: 'India\'s New Data Protection Law',
        content: 'The Digital Personal Data Protection Act, 2023 is India\'s first comprehensive law protecting personal data. Passed by Parliament on August 11, 2023, it gives every Indian citizen new rights over their personal information — and places serious obligations on organisations that collect and use that data.\n\nIf your organisation handles personal data of Indian citizens, this law applies to you.',
      },
      {
        id: 'm1-s2',
        type: 'info',
        title: 'What is "Personal Data"?',
        content: 'Personal data is any information that can identify a person — directly or indirectly.\n\n**Examples:**\n• Name, email address, phone number\n• Aadhaar number, PAN, passport details\n• Location data, IP address, device ID\n• Biometric data (fingerprint, face scan)\n• Health records, financial information\n• Photos and videos showing a person\n\n**Not personal data:**\n• Anonymised data where re-identification is impossible\n• Aggregate statistics (e.g. "60% of users are from Mumbai")',
      },
      {
        id: 'm1-s3',
        type: 'info',
        title: 'Key Obligations for Organisations',
        content: 'As a Data Fiduciary (an organisation that decides what data to collect and why), your organisation must:\n\n1. **Collect only what you need** — data minimisation\n2. **Tell people why you\'re collecting their data** — privacy notice (Section 5)\n3. **Get clear consent before collecting personal data** — Section 6\n4. **Respond to individuals who ask about their data** — 30-day deadline\n5. **Protect data with appropriate security measures** — Section 8\n6. **Report data breaches to the DPB within 72 hours** — Section 8(6)\n7. **Appoint a Grievance Officer** — Section 13',
      },
      {
        id: 'm1-s4',
        type: 'info',
        title: 'The Penalties Are Real',
        content: 'The Data Protection Board (DPB) can impose financial penalties for violations.\n\n| Violation | Maximum Penalty |\n|-----------|----------------|\n| Failure to notify a data breach | ₹200 crore |\n| Failure to protect children\'s data | ₹200 crore |\n| Failure to implement security safeguards | ₹250 crore |\n| Non-compliance with DPB directions | ₹150 crore |\n| Other violations | ₹50 crore |\n\nFull enforcement begins in 2027. Companies that prepare now will not be caught off guard.',
      },
      {
        id: 'm1-s5',
        type: 'scenario',
        title: 'Scenario: The New App Feature',
        content: 'Your product team wants to add a feature that uses customers\' location history to suggest nearby stores. The data is already being collected for delivery purposes.\n\nThe question is: can you reuse location data for a different purpose?',
      },
      {
        id: 'm1-q1',
        type: 'quiz',
        title: 'Quiz: Purpose Limitation',
        content: 'Under the DPDP Act, an organisation collected a customer\'s address for delivery. Can it now use that address to send promotional materials?',
        options: [
          { text: 'Yes, since the data is already collected', correct: false },
          { text: 'Yes, but only if the customer is notified', correct: false },
          { text: 'No, unless the customer gives separate consent for the new purpose', correct: true },
          { text: 'No, personal data can never be reused', correct: false },
        ],
        explanation: 'Under DPDP Act Section 6, personal data must be processed only for the specific purpose for which consent was given. Using it for a different purpose requires new, specific consent from the Data Principal.',
      },
      {
        id: 'm1-q2',
        type: 'quiz',
        title: 'Quiz: Breach Timeline',
        content: 'A data breach is discovered on Monday at 9 AM. By when must the Data Protection Board be notified?',
        options: [
          { text: 'By end of Monday (same day)', correct: false },
          { text: 'Within 72 hours — by Thursday 9 AM', correct: true },
          { text: 'Within 7 days', correct: false },
          { text: 'Within 30 days', correct: false },
        ],
        explanation: 'DPDP Act Section 8(6) requires organisations to notify the Data Protection Board of a breach "in such manner and within such period as may be prescribed." The expected standard is 72 hours from detection, mirroring global best practice.',
      },
      {
        id: 'm1-q3',
        type: 'quiz',
        title: 'Quiz: Consent',
        content: 'What makes consent valid under the DPDP Act?',
        options: [
          { text: 'A pre-ticked checkbox on a website', correct: false },
          { text: 'A vague statement that the user "agrees to terms"', correct: false },
          { text: 'A clear, specific, informed statement for a defined purpose', correct: true },
          { text: 'Verbal agreement recorded by the sales team', correct: false },
        ],
        explanation: 'DPDP Act Section 6(1) requires consent to be free, specific, informed, unconditional, and unambiguous. It must be a clear affirmative action — pre-ticked boxes and bundled terms do not meet this standard.',
      },
      {
        id: 'm1-q4',
        type: 'quiz',
        title: 'Quiz: Grievance Officer',
        content: 'Under the DPDP Act, who must every Data Fiduciary appoint?',
        options: [
          { text: 'A Data Protection Officer (DPO)', correct: false },
          { text: 'A Chief Privacy Officer', correct: false },
          { text: 'A Grievance Officer to handle Data Principal requests', correct: true },
          { text: 'An external legal counsel', correct: false },
        ],
        explanation: 'Section 13 of the DPDP Act requires every Data Fiduciary to publish the contact details of a Grievance Officer who handles requests and complaints from Data Principals. A separate DPO is required only for Significant Data Fiduciaries.',
      },
      {
        id: 'm1-q5',
        type: 'quiz',
        title: 'Quiz: Who Does DPDP Apply To?',
        content: 'A company headquartered in Singapore processes personal data of Indian citizens for its India business. Does the DPDP Act apply?',
        options: [
          { text: 'No — the company is not based in India', correct: false },
          { text: 'Yes — DPDP applies wherever personal data of Indian citizens is processed', correct: true },
          { text: 'Only if the company has offices in India', correct: false },
          { text: 'Only if the processing happens on Indian servers', correct: false },
        ],
        explanation: 'The DPDP Act has extraterritorial application. It applies to the processing of personal data within India, and also to the processing of personal data outside India in connection with the profiling of persons within India. Location of the company is not the deciding factor.',
      },
    ],
  },
  {
    id: 'module-2',
    title: 'What is Personal Data?',
    description: 'Learn to identify personal data, sensitive data, and special categories — including children\'s data, health records, and biometrics.',
    xpReward: 100,
    slides: [
      {
        id: 'm2-s1',
        type: 'intro',
        title: 'Not All Data Is the Same',
        content: 'Under the DPDP Act, all personal data receives protection. But some categories of data deserve extra care because exposure causes significantly more harm.\n\nIn this module, we\'ll help you identify what counts as personal data, what makes data "sensitive," and how special categories like children\'s data require a higher standard of care.',
      },
      {
        id: 'm2-s2',
        type: 'info',
        title: 'The Indian Context: Identifiers to Know',
        content: 'In India, certain identifiers are particularly sensitive because they unlock multiple other data points:\n\n• **Aadhaar** — links to biometrics, address, and government services\n• **PAN** — links to financial history and tax records\n• **UPI ID / Bank account** — financial access\n• **Mobile number** — increasingly a universal identifier\n• **Voter ID / Passport** — citizenship and identity\n\nWhen these identifiers are combined with other data (name + phone + location), the result is a detailed profile that carries significant re-identification risk.',
      },
      {
        id: 'm2-s3',
        type: 'info',
        title: 'Children\'s Data: Special Rules',
        content: 'The DPDP Act (Section 9) places specific restrictions on processing data of children under 18:\n\n1. **Verifiable parental consent is mandatory** — not just a checkbox\n2. **No tracking or behavioural monitoring of children**\n3. **No targeted advertising directed at children**\n4. **Processing for care and protection of children** may be allowed without explicit consent in limited circumstances\n\nIf your organisation\'s services are used by or directed at minors, you must implement age verification and parental consent mechanisms. Violations can attract penalties up to ₹200 crore.',
      },
      {
        id: 'm2-q1',
        type: 'quiz',
        title: 'Quiz: Is This Personal Data?',
        content: 'A company stores the average order value by PIN code (e.g. "₹850 average order in 400001"). Is this personal data?',
        options: [
          { text: 'Yes — it contains location data', correct: false },
          { text: 'Yes — it could be used to identify individuals', correct: false },
          { text: 'No — it is aggregate data that cannot identify any individual', correct: true },
          { text: 'It depends on whether the company has other data', correct: false },
        ],
        explanation: 'Aggregate statistics that cannot be linked back to individual persons are not personal data. However, data must be genuinely anonymised — "pseudonymised" data that can be re-linked with additional information still qualifies as personal data.',
      },
      {
        id: 'm2-q2',
        type: 'quiz',
        title: 'Quiz: Children\'s Consent',
        content: 'A 15-year-old signs up for your e-learning platform using their email address. What must you do?',
        options: [
          { text: 'Accept the signup — the child chose to sign up', correct: false },
          { text: 'Ask the child if they have parental permission', correct: false },
          { text: 'Obtain verifiable consent from a parent or guardian before processing the child\'s data', correct: true },
          { text: 'Process the data but restrict it to non-sensitive use', correct: false },
        ],
        explanation: 'Section 9 of the DPDP Act requires verifiable consent from a parent or lawful guardian before processing personal data of anyone under 18. A child\'s self-declaration is not sufficient.',
      },
      {
        id: 'm2-q3',
        type: 'quiz',
        title: 'Quiz: Sensitive Data',
        content: 'Which of the following requires the most careful handling?',
        options: [
          { text: 'A customer\'s name and city', correct: false },
          { text: 'A list of product preferences', correct: false },
          { text: 'Medical records combined with Aadhaar number', correct: true },
          { text: 'Purchase timestamps', correct: false },
        ],
        explanation: 'Medical records are inherently sensitive. When combined with an Aadhaar number — which serves as a master identifier — the combination creates a highly identifiable, sensitive profile. Both the sensitivity and the potential for harm are significantly elevated.',
      },
      {
        id: 'm2-q4',
        type: 'quiz',
        title: 'Quiz: Biometric Data',
        content: 'Your office uses fingerprint scanners for attendance. This data:',
        options: [
          { text: 'Is not personal data as it\'s used only internally', correct: false },
          { text: 'Is personal data and must be protected as such', correct: true },
          { text: 'Is only personal data if stored digitally', correct: false },
          { text: 'Is excluded from DPDP as it\'s used for security purposes', correct: false },
        ],
        explanation: 'Biometric data is personal data and highly sensitive. Even when used for legitimate purposes like attendance, it must be stored securely, retained only as long as necessary, and employees must be informed about its collection and use.',
      },
      {
        id: 'm2-q5',
        type: 'quiz',
        title: 'Quiz: De-identification',
        content: 'You remove names from a dataset but keep email addresses. Is this dataset now anonymised?',
        options: [
          { text: 'Yes — names have been removed', correct: false },
          { text: 'No — email addresses can still identify individuals', correct: true },
          { text: 'It depends on who has access to the dataset', correct: false },
          { text: 'Yes, if the dataset is not shared externally', correct: false },
        ],
        explanation: 'Email addresses are personal data — they uniquely identify individuals. Removing a name while retaining an email address does not anonymise the data. Anonymisation requires that re-identification is not reasonably possible by any means.',
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Rights of Data Principals',
    description: 'Understand what rights individuals have over their data: access, correction, erasure, grievance, and nomination.',
    xpReward: 100,
    slides: [
      {
        id: 'm3-s1',
        type: 'intro',
        title: 'Your Customers Have Rights',
        content: 'The DPDP Act gives every Indian citizen — called a "Data Principal" — six specific rights over their personal data held by your organisation.\n\nThese aren\'t aspirational goals. They\'re legal rights with statutory deadlines. If your organisation fails to respond within the mandated timeframe, penalties can follow.',
      },
      {
        id: 'm3-s2',
        type: 'info',
        title: 'The Six Rights',
        content: '**1. Right to Access (Section 11)** — Know what data the organisation holds about them and how it is being used.\n\n**2. Right to Correction (Section 12)** — Get inaccurate or outdated data corrected.\n\n**3. Right to Erasure (Section 12)** — Request deletion of data when it is no longer necessary.\n\n**4. Right to Grievance Redressal (Section 13)** — Complain if rights are not fulfilled, with a dedicated Grievance Officer.\n\n**5. Right to Nomination (Section 14)** — Nominate someone to exercise rights on their behalf if they become incapacitated or die.\n\n**6. Right to Withdraw Consent (Section 6)** — Withdraw consent at any time, after which processing must stop.',
      },
      {
        id: 'm3-s3',
        type: 'info',
        title: 'Deadlines That Cannot Be Ignored',
        content: 'The law mandates response timelines:\n\n| Request Type | Deadline |\n|---|---|\n| Access / Correction / Erasure | **30 days** from receipt |\n| Grievance redressal | **30 days** |\n| Urgent requests (e.g. safety risk) | **7 days** |\n\nFailure to respond within deadline:\n- First: Grievance escalation to the Data Protection Board\n- Second: Financial penalties\n\nYour PACT360 platform automatically tracks these deadlines and alerts your team before they expire.',
      },
      {
        id: 'm3-q1',
        type: 'quiz',
        title: 'Quiz: Right to Erasure',
        content: 'A customer stops using your service and asks you to delete all their data. Must you comply?',
        options: [
          { text: 'No — you can retain data as long as you have their email on file', correct: false },
          { text: 'Yes — you must delete all data immediately', correct: false },
          { text: 'Yes — unless you have a legal or statutory obligation to retain the data', correct: true },
          { text: 'Only if the customer submits the request in writing', correct: false },
        ],
        explanation: 'The right to erasure is real but not absolute. You must comply unless retention is required by law (e.g. tax records, audit requirements, court orders) or is necessary to resolve an ongoing dispute. In all other cases, deletion is mandatory.',
      },
      {
        id: 'm3-q2',
        type: 'quiz',
        title: 'Quiz: Response Deadline',
        content: 'A Data Principal submitted an access request on March 1. By when must you respond?',
        options: [
          { text: 'By March 8 (7 days)', correct: false },
          { text: 'By March 31 (30 days)', correct: true },
          { text: 'By April 30 (60 days)', correct: false },
          { text: 'There is no specific deadline', correct: false },
        ],
        explanation: 'The DPDP Act requires responses to access, correction, and erasure requests within 30 days. Missing this deadline without a valid reason constitutes a violation that can be escalated to the Data Protection Board.',
      },
      {
        id: 'm3-q3',
        type: 'quiz',
        title: 'Quiz: Consent Withdrawal',
        content: 'A customer withdraws consent for receiving marketing emails. What must happen?',
        options: [
          { text: 'Stop marketing emails at the next newsletter cycle', correct: false },
          { text: 'Stop marketing emails immediately and delete the data used only for that purpose', correct: true },
          { text: 'Send one final email confirming the withdrawal', correct: false },
          { text: 'Continue for 30 days to allow for the transition', correct: false },
        ],
        explanation: 'Section 6(5) of the DPDP Act says withdrawal of consent takes effect immediately. Processing for the withdrawn purpose must cease, and data that was collected only for that purpose must be erased. You may retain data still needed for other legal or contractual obligations.',
      },
      {
        id: 'm3-q4',
        type: 'quiz',
        title: 'Quiz: Nomination',
        content: 'A customer passes away. Their family asks to exercise the customer\'s data rights. Is this possible?',
        options: [
          { text: 'No — data rights expire with the individual', correct: false },
          { text: 'Yes — if the customer had nominated someone to act on their behalf', correct: true },
          { text: 'Yes — any family member can exercise the rights', correct: false },
          { text: 'Only courts can exercise rights on behalf of a deceased person', correct: false },
        ],
        explanation: 'Section 14 of the DPDP Act gives individuals the right to nominate another person to exercise their data rights on their behalf in case of death or incapacity. Only a validly nominated person — not any family member — can exercise these rights.',
      },
      {
        id: 'm3-q5',
        type: 'quiz',
        title: 'Quiz: Grievance Officer',
        content: 'A customer says their correction request was ignored. Their next step is:',
        options: [
          { text: 'File a police complaint', correct: false },
          { text: 'Contact the Grievance Officer of your organisation', correct: true },
          { text: 'Go directly to court', correct: false },
          { text: 'Contact the Ministry of Electronics and IT', correct: false },
        ],
        explanation: 'Section 13 establishes a two-step process. First, the Data Principal contacts the organisation\'s Grievance Officer. If unsatisfied, they can then escalate to the Data Protection Board. This internal resolution step is mandatory before DPB complaints.',
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Lawful Data Processing',
    description: 'Learn how consent works, what legitimate use means, and the rules around purpose limitation, data minimisation, and retention.',
    xpReward: 100,
    slides: [
      {
        id: 'm4-s1',
        type: 'intro',
        title: 'You Need a Legal Basis to Process Data',
        content: 'Under the DPDP Act, you cannot collect or process personal data "just because." Every processing activity must have a valid legal basis.\n\nThere are two primary bases:\n\n1. **Consent** — the individual has given clear, specific, voluntary consent\n2. **Legitimate Use** — processing is permitted by law without consent in specific situations\n\nIf neither applies, you cannot process the data.',
      },
      {
        id: 'm4-s2',
        type: 'info',
        title: 'What Valid Consent Looks Like',
        content: 'Consent under DPDP Act Section 6 must be:\n\n✓ **Free** — not conditional on accessing a service\n✓ **Specific** — for a clearly defined purpose, not vague categories\n✓ **Informed** — after being provided a privacy notice in plain language\n✓ **Unconditional** — not bundled with acceptance of unrelated terms\n✓ **Unambiguous** — a clear affirmative action (tick a box, sign a form)\n\n**What does NOT count as consent:**\n✗ Pre-ticked boxes\n✗ "By using this app, you agree to..."\n✗ Silence or inaction\n✗ Consent forced as a condition of service access',
      },
      {
        id: 'm4-s3',
        type: 'info',
        title: 'Legitimate Use: When No Consent Is Needed',
        content: 'Section 7 of the DPDP Act allows processing without consent in certain defined situations:\n\n• **State functions** — government agencies performing official duties\n• **Legal compliance** — processing required by law or court order\n• **Medical emergencies** — to protect someone\'s life or health\n• **Employment** — processing employee data for employment purposes\n• **Safety and prevention** — to prevent harm to individuals\n• **Public interest** — research, archiving, statistical purposes\n\nImportant: Legitimate use is narrower than it sounds. Organisations cannot claim "legitimate use" as a general exemption. The specific circumstances must match one of the enumerated categories.',
      },
      {
        id: 'm4-q1',
        type: 'quiz',
        title: 'Quiz: Is Consent Valid?',
        content: 'A food delivery app says "To use our app, you must consent to receive personalised marketing emails." Is this valid consent?',
        options: [
          { text: 'Yes — the user has the choice to not use the app', correct: false },
          { text: 'No — consent cannot be a condition for accessing a service if it is for a separate purpose', correct: true },
          { text: 'Yes — as long as the consent checkbox is visible', correct: false },
          { text: 'It depends on whether the user can unsubscribe later', correct: false },
        ],
        explanation: 'Making consent a condition of service access violates the "free" requirement of Section 6. Consent for marketing is a separate purpose from using the delivery service. Bundling them means the user has no genuine choice.',
      },
      {
        id: 'm4-q2',
        type: 'quiz',
        title: 'Quiz: Data Minimisation',
        content: 'Your website asks for name, email, phone, date of birth, and home address to create a free newsletter subscription. Which is a concern?',
        options: [
          { text: 'Collecting name — too personal', correct: false },
          { text: 'Collecting date of birth and address — not necessary for a newsletter', correct: true },
          { text: 'Collecting email — unnecessary for newsletters', correct: false },
          { text: 'No concern — users can choose what to fill in', correct: false },
        ],
        explanation: 'The DPDP Act requires collecting only data that is "necessary for the specified purpose." A newsletter only needs an email address. Date of birth and home address serve no purpose for newsletter delivery and should not be collected.',
      },
      {
        id: 'm4-q3',
        type: 'quiz',
        title: 'Quiz: Retention',
        content: 'A user\'s account was deleted 3 years ago. Can the company continue to store their purchase history?',
        options: [
          { text: 'Yes — historical data is always valuable for analytics', correct: false },
          { text: 'Yes — for up to 7 years for tax purposes', correct: false },
          { text: 'Only if retention is required by a specific law (e.g. tax regulations)', correct: true },
          { text: 'No — all data must be deleted the day the account is closed', correct: false },
        ],
        explanation: 'The DPDP Act requires that personal data is retained only as long as necessary for the purpose it was collected, or as required by law. After that, it must be erased. Retaining purchase history for general analytics after account deletion is not permitted without a specific legal basis.',
      },
      {
        id: 'm4-q4',
        type: 'quiz',
        title: 'Quiz: Legitimate Use',
        content: 'An HR team processes employee payroll data without asking for individual consent. Is this lawful?',
        options: [
          { text: 'No — all data processing requires consent', correct: false },
          { text: 'Yes — processing employee data for employment purposes is a legitimate use under Section 7', correct: true },
          { text: 'Only if the employment contract mentions it', correct: false },
          { text: 'Only if the employee is a permanent employee (not contract)', correct: false },
        ],
        explanation: 'Section 7 of the DPDP Act includes "employment" as a legitimate use case. Processing personal data for payroll, tax compliance, and employment management does not require separate consent — the employment relationship itself provides the lawful basis.',
      },
      {
        id: 'm4-q5',
        type: 'quiz',
        title: 'Quiz: Purpose Limitation',
        content: 'Customer data collected for order delivery is used by the analytics team for building customer behaviour models. Is this permitted?',
        options: [
          { text: 'Yes — internal use is always permitted', correct: false },
          { text: 'No — the data was collected for delivery, not analytics', correct: true },
          { text: 'Yes — if the customer agreed to general terms of service', correct: false },
          { text: 'Only if the data is anonymised first', correct: false },
        ],
        explanation: 'The DPDP Act\'s purpose limitation principle means data can only be used for the purpose the customer consented to. Using delivery data for analytics is a new, different purpose requiring a new consent or a valid legitimate use basis. Even general terms of service acceptance does not satisfy this.',
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Keeping Data Safe',
    description: 'Security safeguards, breach response obligations, and your personal responsibilities as an employee handling personal data.',
    xpReward: 100,
    slides: [
      {
        id: 'm5-s1',
        type: 'intro',
        title: 'Data Security Is Everyone\'s Responsibility',
        content: 'The DPDP Act places a legal obligation on organisations to implement "reasonable security safeguards" to protect personal data (Section 8). But security is not just an IT department problem.\n\nEvery employee who touches personal data — whether reviewing customer records, sending emails, or accessing internal systems — plays a role in protecting that data.\n\nA single mistake — like sending a file to the wrong person, or clicking a phishing link — can trigger a reportable breach.',
      },
      {
        id: 'm5-s2',
        type: 'info',
        title: 'What Is a Data Breach?',
        content: 'A data breach is any accidental or unlawful event that:\n\n• **Destroys** personal data (accidental deletion, ransomware)\n• **Loses** personal data (lost laptop, misdirected email)\n• **Alters** personal data (tampering with records)\n• **Accesses** personal data without authorisation (hacking, insider threat)\n• **Discloses** personal data to the wrong recipient\n\n**Breaches can be:**\n- A cyberattack on your systems\n- An employee emailing the wrong person\n- A database left publicly accessible\n- Paperwork containing personal data lost in transit\n- A vendor who suffers a breach affecting your data',
      },
      {
        id: 'm5-s3',
        type: 'info',
        title: 'The 72-Hour Clock',
        content: 'When a data breach occurs, a statutory clock starts immediately:\n\n**72 hours** — Notify the Data Protection Board (DPB)\n**7 days** — Notify affected individuals if the breach is likely to cause them harm\n\n**What to include in DPB notification:**\n- What happened (nature of the breach)\n- What data was affected and how many individuals\n- What you are doing to contain it\n- Contact details for follow-up\n\nDo not wait for full information before reporting. Report what you know with the note that investigation is ongoing. Failure to report on time can attract penalties of up to ₹200 crore.',
      },
      {
        id: 'm5-s4',
        type: 'info',
        title: 'Your Personal Do\'s and Don\'ts',
        content: '**Do:**\n✓ Use strong, unique passwords and enable 2FA\n✓ Lock your screen when stepping away from your desk\n✓ Verify email recipients before sending any customer data\n✓ Report suspicious emails or access requests to IT immediately\n✓ Follow your company\'s data retention and disposal policy\n✓ Encrypt files containing personal data before sharing\n\n**Don\'t:**\n✗ Share passwords or access credentials with colleagues\n✗ Download customer data to personal devices\n✗ Use personal email to send work files with personal data\n✗ Discuss customer data in public or on personal devices\n✗ Click links or attachments in suspicious emails\n✗ Ignore security alerts from IT',
      },
      {
        id: 'm5-q1',
        type: 'quiz',
        title: 'Quiz: Breach Response',
        content: 'You discover that a colleague accidentally emailed an Excel file with 500 customer records to the wrong email address. What do you do?',
        options: [
          { text: 'Ignore it — one email is unlikely to cause harm', correct: false },
          { text: 'Quietly delete the email and hope the recipient doesn\'t open it', correct: false },
          { text: 'Report it to your manager or the Data Protection Officer immediately', correct: true },
          { text: 'Wait to see if any customers complain before acting', correct: false },
        ],
        explanation: 'A misdirected email containing 500 customer records is a reportable data breach. You must report it internally immediately so the organisation can assess the risk, attempt to recall the email, and meet the statutory 72-hour DPB notification deadline if required.',
      },
      {
        id: 'm5-q2',
        type: 'quiz',
        title: 'Quiz: Password Security',
        content: 'A colleague is on leave and asks you to use their login to access a customer record urgently. You should:',
        options: [
          { text: 'Use their credentials — it\'s urgent and they\'re authorised anyway', correct: false },
          { text: 'Refuse and escalate through your manager to get proper authorisation', correct: true },
          { text: 'Use their credentials but keep a note that it was you', correct: false },
          { text: 'Wait until the colleague returns', correct: false },
        ],
        explanation: 'Sharing login credentials creates accountability gaps and constitutes unauthorised access — even with the colleague\'s permission. The colleague\'s account may have permissions you are not authorised to exercise. Escalate through proper channels to get access if genuinely needed.',
      },
      {
        id: 'm5-q3',
        type: 'quiz',
        title: 'Quiz: Phishing',
        content: 'You receive an email that appears to be from your CEO asking you to send a list of all employee salaries urgently. What do you do?',
        options: [
          { text: 'Send it — the CEO is authorised to see this data', correct: false },
          { text: 'Verify the request through a separate communication channel before responding', correct: true },
          { text: 'Send a partial list to reduce the risk', correct: false },
          { text: 'Reply to the email asking for confirmation', correct: false },
        ],
        explanation: 'This is a classic Business Email Compromise (BEC) / CEO fraud phishing attempt. Verify any unusual request — especially for bulk personal data — through a separate channel (call the CEO directly). Replying to the suspicious email does not help, as the attacker controls that channel.',
      },
      {
        id: 'm5-q4',
        type: 'quiz',
        title: 'Quiz: Device Security',
        content: 'You are working from a café and step away from your laptop for 5 minutes to get coffee. What should you do?',
        options: [
          { text: 'Nothing — it\'s only 5 minutes', correct: false },
          { text: 'Log out of all applications before leaving', correct: false },
          { text: 'Lock your screen (Win+L or Cmd+Ctrl+Q)', correct: true },
          { text: 'Close the laptop lid', correct: false },
        ],
        explanation: 'Locking your screen is the right action. Closing the lid may not lock the screen depending on settings. Logging out takes too long and may lose work. Even 30 seconds of unattended access to a screen showing customer data constitutes a potential breach.',
      },
      {
        id: 'm5-q5',
        type: 'quiz',
        title: 'Final Quiz: Vendor Breach',
        content: 'Your third-party email marketing vendor reports that they suffered a cyberattack and your customer email list was compromised. Is this your organisation\'s breach?',
        options: [
          { text: 'No — it happened to the vendor, not to us', correct: false },
          { text: 'Yes — as the Data Fiduciary, your obligations apply regardless of where the breach occurred', correct: true },
          { text: 'Only if the vendor shared our data with others', correct: false },
          { text: 'Only if the customers sue the vendor', correct: false },
        ],
        explanation: 'Under the DPDP Act, the Data Fiduciary (your organisation) remains responsible for data even when it is processed by a third-party Data Processor. You must notify the DPB within 72 hours and assess whether affected customers need to be notified. Choosing a vendor with adequate security practices is part of your compliance obligation.',
      },
    ],
  },
]

export function getModuleById(id: string): TrainingModuleContent | undefined {
  return TRAINING_MODULES.find(m => m.id === id)
}
