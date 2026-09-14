import type { LegalPageId } from "./legalConfig";
import { legalEntity, legalJurisdiction, privacyContactLine } from "./legalConfig";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: LegalPageId;
  title: string;
  kicker: string;
  intro: string;
  sections: LegalSection[];
};

function counselNote(entity: string): string {
  return `These pages describe how ${entity} operates this website and chairside demo. They are not legal advice. A dental practice that uses this software for real patients is the HIPAA covered entity for those patients and should have its own counsel review, complete, and adopt a Notice of Privacy Practices, Business Associate Agreement, and clinic policies before any protected health information is used.`;
}

function privacyDoc(entity: string, contact: string): LegalDocument {
  return {
    id: "privacy",
    title: "Privacy Policy",
    kicker: "Website and product",
    intro: `This Privacy Policy explains how ${entity} collects, uses, and shares information when you visit this website, watch a demo, or use the chairside charting screens. ${counselNote(entity)}`,
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `${entity} provides chairside software that listens to a hygienist chart a periodontal exam, fills a tooth grid, and explains findings in everyday language. This site is a product and demonstration website, not a dental practice and not a substitute for care from a licensed dentist or hygienist.`,
        ],
      },
      {
        heading: "Whose rules apply",
        paragraphs: [
          "If you are a website visitor, this policy covers the limited information this site may collect about your browser session.",
          `If you are a patient in a dental chair, your treating practice is the HIPAA covered entity. ${entity} is a business associate only when a clinic has signed a Business Associate Agreement and is running a production deployment that handles real patient information.`,
          "The public demo uses sample chart data (the seeded patient Andrew) and keeps that exam in browser memory for the session. It is not a live patient record.",
        ],
      },
      {
        heading: "Information we collect",
        paragraphs: ["Depending on how you use the site, we may process:"],
        bullets: [
          "Technical data needed to serve the pages: browser type, language, and similar request metadata held by the host you or your clinic configure.",
          "Cookie preference: whether you accepted optional cookies. That choice is stored in your browser only.",
          "Demo chart data: spoken or scripted periodontal readings, which stay in the clinician tab’s memory and may be copied to a same-origin patient window over BroadcastChannel.",
          "Microphone audio, only after you press Listen. Speech is transcribed in the browser. This demo does not upload audio to a practice-management system.",
          "Contact details you choose to send to the privacy officer, if an email address is configured for this deployment.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: ["We use information to:"],
        bullets: [
          "Operate and secure the website and demo.",
          "Show the periodontal chart and patient-facing explanation during a session.",
          "Honor cookie and privacy choices.",
          "Respond to privacy or accessibility requests sent to the contact below.",
          "Meet legal duties, including HIPAA duties that apply when a clinic uses a production deployment under a Business Associate Agreement.",
        ],
      },
      {
        heading: "Protected health information",
        paragraphs: [
          "HIPAA protected health information (PHI) is information that identifies a patient and relates to health, care, or payment. Sample demo names and pocket depths in this repository are demonstration data.",
          `Do not enter real patient identifiers into the public demo. A clinic must not put live PHI into this software until it has a signed Business Associate Agreement with ${entity} or its hosting affiliate, clinic access controls, and a production environment the clinic owns or has contracted for.`,
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          `${entity} does not sell personal information and does not share it for cross-context behavioral advertising.`,
          "We share information only: with service providers bound to protect it; with a dental practice that is the covered entity for its patients; when you ask us to; or when law requires it, including a valid court order or a report required by dental-practice rules.",
        ],
      },
      {
        heading: "Cookies and local storage",
        paragraphs: [
          "This site uses a necessary cookie-preference record in localStorage so we can remember your choice. The chairside demo does not write the exam to localStorage. See the Cookie Policy for details.",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "Demo exam data lasts for the browser session. Closing the tab or using Reset chart clears today’s readings from memory. Cookie preference remains until you change it or clear site data. Production retention, if a clinic later deploys one, is set by that clinic’s record-retention policy and dental-board rules, not by this demo.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "Speech-to-text in this demo runs in the clinician browser. Chart events stay on the same origin. Open Dental requests are built and displayed, not sent. These are design choices for a demo. They are not, by themselves, a complete HIPAA Security Rule program. See HIPAA & BAA for the remaining production controls.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "This website is not directed at children under 13, and we do not knowingly collect personal information from children through the marketing pages. Dental practices often treat minors. A parent or guardian’s rights in a real record are handled by the treating practice under HIPAA and state dental law, not by this public demo.",
        ],
      },
      {
        heading: "State privacy rights",
        paragraphs: [
          "If U.S. state privacy laws such as the California Consumer Privacy Act (as amended by the CPRA) apply to you, you may have rights to know, access, correct, delete, and opt out of sale or sharing. We do not sell or share personal information as those statutes define those terms. Use Your Privacy Choices or write to the privacy contact below.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update this policy. The effective date at the top of the page is the current version. Material changes to how a production clinic deployment handles PHI would also be reflected in that clinic’s Notice of Privacy Practices.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Privacy questions: ${contact}. If you are a patient of a dental practice, you may also contact that practice’s privacy officer. You may file a HIPAA complaint with the U.S. Department of Health and Human Services Office for Civil Rights at https://www.hhs.gov/hipaa/filing-a-complaint/.`,
        ],
      },
    ],
  };
}

function nppDoc(entity: string, contact: string): LegalDocument {
  return {
    id: "npp",
    title: "Notice of Privacy Practices",
    kicker: "HIPAA",
    intro: "THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.",
    sections: [
      {
        heading: "Who this notice covers",
        paragraphs: [
          `This notice is the HIPAA Notice of Privacy Practices for ${entity} when ${entity} creates or receives protected health information as a business associate of a dental practice, and for visitors who submit privacy requests through this website.`,
          "Your treating dentist or dental practice remains the covered entity for your clinical record. Ask that practice for its own Notice of Privacy Practices. This page does not replace the notice your dentist must give you.",
          counselNote(entity),
        ],
      },
      {
        heading: "Our duties",
        paragraphs: [
          "We are required by law to maintain the privacy and security of protected health information, to notify affected people if a breach of unsecured PHI occurs, to follow the duties and privacy practices described in this notice, and not to use or share PHI other than as described here unless you tell us we can in writing. You may change that permission in writing at any time.",
        ],
      },
      {
        heading: "How we may use and share PHI",
        paragraphs: ["For a production clinic deployment under a Business Associate Agreement, PHI may be used or disclosed for:"],
        bullets: [
          "Treatment: showing the hygienist, dentist, and patient the periodontal chart and plain-language explanation during the visit.",
          "Payment: supporting billing or insurance workflows the clinic directs, if those workflows are later connected. This demo does not send claims or Open Dental writes.",
          "Health care operations: quality review, training, and running the chairside software for the clinic.",
          "As required by law, public-health, abuse or neglect reporting, health oversight, legal proceedings, law enforcement, coroners, organ donation, research under HIPAA conditions, to prevent a serious threat to health or safety, and for workers’ compensation as the rules allow.",
        ],
      },
      {
        heading: "Uses that need your written authorization",
        paragraphs: [
          "Most uses of PHI for marketing, the sale of PHI, and most sharing of psychotherapy notes (which this dental charting product does not create) require your written authorization. You may revoke an authorization in writing except to the extent we have already relied on it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: ["When HIPAA applies to a record we hold for a clinic, you have the right to:"],
        bullets: [
          "Get an electronic or paper copy of your PHI, through your dental practice’s process.",
          "Ask us or the practice to correct PHI you believe is incorrect or incomplete.",
          "Ask for confidential communications, such as contacting you at a different address.",
          "Ask us to limit what we use or share for treatment, payment, or operations. We may say no if it would affect care, except we must agree when you pay in full out of pocket and ask us not to share that item with a health plan, unless a law requires the share.",
          "Get a list of certain disclosures we made of your PHI.",
          "Get a paper copy of this notice at any time.",
          "Choose someone to act for you, if they have medical power of attorney or are a legal guardian.",
          "File a complaint if you believe your privacy rights have been violated, without retaliation.",
        ],
      },
      {
        heading: "Electronic communications and the operatory",
        paragraphs: [
          "Microphone audio in this demo is processed in the clinician’s browser after someone presses Listen. Same-origin windows may share chart events. Email, SMS, and consumer messaging are not used by this demo to send PHI. A clinic that later texts or emails patients must use methods that clinic has assessed for HIPAA.",
        ],
      },
      {
        heading: "Complaints",
        paragraphs: [
          `Contact ${contact}. You may also file a complaint with the U.S. Department of Health and Human Services Office for Civil Rights, 200 Independence Avenue S.W., Washington, D.C. 20201, 1-877-696-6775, or https://www.hhs.gov/hipaa/filing-a-complaint/. We will not retaliate against you for filing a complaint.`,
        ],
      },
      {
        heading: "Changes to this notice",
        paragraphs: [
          "We can change the terms of this notice, and the changes will apply to all information we have about you. The new notice will be available on this website and on request.",
        ],
      },
    ],
  };
}

function termsDoc(entity: string, contact: string, jurisdiction: string): LegalDocument {
  return {
    id: "terms",
    title: "Terms of Use",
    kicker: "Website and demo",
    intro: `These Terms of Use are an agreement between you and ${entity} for this website and the chairside demonstration. If you do not agree, do not use the site. ${counselNote(entity)}`,
    sections: [
      {
        heading: "The service",
        paragraphs: [
          `${entity} offers an informational website and a demonstration of periodontal charting. The demo transcribes speech in the browser, parses tooth numbers and pocket depths, and shows clinician and patient views. It does not write to a live practice-management system.`,
        ],
      },
      {
        heading: "Not a dental practice",
        paragraphs: [
          `${entity} is not your dentist, hygienist, or health-care provider. Nothing on this site is a diagnosis, treatment plan, or professional dental advice. Emergency symptoms require a licensed clinician or emergency services, not this software. See the Dental Disclaimer.`,
        ],
      },
      {
        heading: "Accounts and demo data",
        paragraphs: [
          "This deployment has no login. Do not type real patient names, record numbers, insurance identifiers, or other PHI into the demo. The seeded patient Andrew is sample data for demonstration.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: ["You agree not to:"],
        bullets: [
          "Use the site to violate HIPAA, state dental-practice acts, or other law.",
          "Attempt to break, overload, or reverse-engineer the service beyond what the architecture page already documents.",
          "Record other people without the permission required in your jurisdiction.",
          "Misrepresent the demo as a certified, accredited, or production-cleared medical device.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          `The MolarMind name, logos, copy, and software are owned by ${entity} or its licensors. You receive a limited, revocable license to use the public demo for evaluation. You do not receive a license to copy the product into a clinic production system except under a separate written agreement.`,
        ],
      },
      {
        heading: "Disclaimer of warranties",
        paragraphs: [
          'THE SITE AND DEMO ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. Charting accuracy depends on microphone quality, speech, and the parser’s documented cases.',
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${entity.toUpperCase()} IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL, ARISING FROM THE SITE OR DEMO. LIABILITY FOR THE PUBLIC DEMO IS LIMITED TO FIFTY U.S. DOLLARS (US$50) OR THE AMOUNT YOU PAID TO ${entity.toUpperCase()} FOR THE DEMO IN THE THREE MONTHS BEFORE THE CLAIM, WHICHEVER IS GREATER. Some places do not allow these limits; in those places, they apply only as far as the law allows.`,
        ],
      },
      {
        heading: "Indemnity",
        paragraphs: [
          `You will defend and indemnify ${entity} against claims arising from your misuse of the demo, your entry of real PHI into a non-production deployment, or your violation of these terms.`,
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          `These terms are governed by the laws of ${jurisdiction}, without regard to conflict-of-law rules, except that HIPAA and other federal health-privacy laws apply as they apply. Courts located in ${jurisdiction} have exclusive venue, unless applicable law requires otherwise.`,
        ],
      },
      {
        heading: "Contact",
        paragraphs: [`Questions about these terms: ${contact}.`],
      },
    ],
  };
}

function cookiesDoc(entity: string): LegalDocument {
  return {
    id: "cookies",
    title: "Cookie Policy",
    kicker: "Preferences",
    intro: `This Cookie Policy explains how ${entity} uses cookies and similar storage on this website. It should be read with the Privacy Policy.`,
    sections: [
      {
        heading: "What we use today",
        paragraphs: [
          "This site does not use advertising pixels, social plugins, or third-party analytics cookies.",
          "We store one preference record in your browser’s localStorage after you choose Necessary only or Accept all. That record is not protected health information. It remembers your choice so the banner does not return on every page load.",
          "The chairside exam itself is held in memory for the session. It is not written to cookies or localStorage.",
        ],
      },
      {
        heading: "Necessary storage",
        paragraphs: [
          "Necessary storage is required to remember your cookie choice and to run the pages. The site cannot function as a static brochure plus demo without ordinary browser session behavior.",
        ],
      },
      {
        heading: "Optional analytics",
        paragraphs: [
          "Accept all records that you would allow optional analytics if this deployment later adds a clinic-approved, BAA-covered analytics tool. This build does not load such a tool. Choosing Accept all does not currently send your browsing to an advertiser.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "This site is designed not to call a third-party font or advertising network from the marketing pages. Hosting, DNS, and TLS are provided by whatever host you or the clinic configure. That host’s own logs are governed by that host’s terms and, for PHI, by a Business Associate Agreement when required.",
        ],
      },
      {
        heading: "How to change your mind",
        paragraphs: [
          "Use Change cookie preference on this page, or clear this site’s data in your browser. We may ask again if the consent version changes.",
        ],
      },
    ],
  };
}

function accessibilityDoc(entity: string, contact: string): LegalDocument {
  return {
    id: "accessibility",
    title: "Accessibility Statement",
    kicker: "ADA and WCAG",
    intro: `${entity} intends this website and the chairside screens to be usable by people with disabilities and to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA where practicable. This statement is our ADA / Section 508-style public commitment for the site.`,
    sections: [
      {
        heading: "What we do",
        paragraphs: [],
        bullets: [
          "Semantic headings, buttons, and labels on marketing and legal pages.",
          "A skip-to-content control at the start of the page.",
          "Text alternatives on informational images, including the landing hero and architecture diagram.",
          "Keyboard operation for primary actions on the public pages.",
          "Color is not the only way status is shown on the perio grid (numbers remain in the cells).",
        ],
      },
      {
        heading: "Known limits of this demo",
        paragraphs: [
          "Live speech-to-text depends on a microphone and is not a captioning product for patients with hearing loss. The patient view is a visual explanation of the exam, not a complete auxiliary aid.",
          "Some clinician rehearsal controls are compact and are intended for a trained operator during a demo.",
          "Third-party browser permissions (microphone) are controlled by the browser, not by this page.",
        ],
      },
      {
        heading: "Request an accessible format",
        paragraphs: [
          `If you need this policy, the architecture description, or another public page in a different format, write to ${contact}. Include the page you need and the format that works for you. We will work with you in a reasonable time.`,
        ],
      },
      {
        heading: "Complaints",
        paragraphs: [
          `You may contact ${contact}. You may also use applicable state or federal disability-rights processes. Patients of a dental practice should also tell that practice, which has separate duties under the ADA to provide effective communication in the operatory.`,
        ],
      },
    ],
  };
}

function disclaimerDoc(entity: string): LegalDocument {
  return {
    id: "disclaimer",
    title: "Dental Disclaimer",
    kicker: "Not medical advice",
    intro: `Content on the ${entity} website and in the chairside demo is for education and product demonstration. It is not dental, medical, or hygienist advice, and it is not a diagnosis or treatment plan.`,
    sections: [
      {
        heading: "No clinician-patient relationship",
        paragraphs: [
          `Using this website does not make ${entity} your dentist. Only a licensed dentist or hygienist who has examined you can diagnose periodontal disease, decay, or other conditions.`,
        ],
      },
      {
        heading: "Demo patient data",
        paragraphs: [
          "The seeded patient Andrew and March comparison values are sample data. They are not a real person. Do not treat those numbers as your own chart.",
        ],
      },
      {
        heading: "Emergencies",
        paragraphs: [
          "If you have uncontrolled bleeding, swelling that affects breathing or swallowing, trauma, or other urgent symptoms, contact a dentist, an emergency department, or emergency services immediately. Do not use this site for emergencies.",
        ],
      },
      {
        heading: "No device marketing claim",
        paragraphs: [
          "This demo is software for charting and explanation. It is not marketed here as an FDA-cleared medical device. Parser output can be wrong if speech is unclear. A clinician must review the chart.",
        ],
      },
    ],
  };
}

function hipaaDoc(entity: string, contact: string): LegalDocument {
  return {
    id: "hipaa",
    title: "HIPAA and Business Associate Practices",
    kicker: "Clinics and vendors",
    intro: `This page states how ${entity} approaches HIPAA for dental practices. It is a product and website disclosure, not a certificate, seal, or independent audit report.`,
    sections: [
      {
        heading: "Roles",
        paragraphs: [
          "A dental practice that treats patients is a HIPAA covered entity. When that practice uses software to create, receive, maintain, or transmit PHI, the software vendor is a business associate and needs a Business Associate Agreement (BAA) before live PHI is processed.",
          `${entity} will sign a BAA before a clinic may use a production deployment with real patients. The public demo is not that production deployment.`,
        ],
      },
      {
        heading: "What this demo already does",
        paragraphs: [],
        bullets: [
          "No login and no durable visit database, so the demo does not keep a server-side chart.",
          "Speech-to-text runs in the clinician browser rather than a cloud STT vendor.",
          "The exam store is in-memory Zustand state, not localStorage.",
          "Clinician and patient windows share events on a same-origin BroadcastChannel.",
          "Open Dental API calls are mapped and shown, not sent, so this demo does not transmit PHI to a PMS.",
          "Legal pages, a cookie preference, and a chairside demo notice are part of the public site.",
        ],
      },
      {
        heading: "What a production clinic still needs",
        paragraphs: ["A complete HIPAA program is more than a privacy page. Before live PHI:"],
        bullets: [
          `A signed BAA with ${entity} or the hosting entity, and BAAs with any subcontractor that can see PHI.`,
          "Unique user authentication, role-based access, automatic logoff, and audit logs of who viewed or changed a chart.",
          "Encryption in transit (HTTPS) on the clinic’s host, and encryption at rest if charts are stored.",
          "A clinic-owned or BAA-covered backend if visits must persist after the browser closes.",
          "Workforce training, a sanction policy, a risk analysis under the Security Rule, and a breach-notification procedure.",
          "Physical safeguards for operatory displays so the patient screen is not visible in a public hallway.",
          "Minimum-necessary access and no real PHI in the public demo, marketing screenshots, or issue trackers.",
        ],
      },
      {
        heading: "Subcontractors",
        paragraphs: [
          "This demo does not send audio or charts to an LLM or to Open Dental. A future production host, error-reporting tool, or analytics tool that can receive PHI must be under a BAA. Optional analytics remain off in this build.",
        ],
      },
      {
        heading: "Breach notification",
        paragraphs: [
          `If ${entity} discovers a breach of unsecured PHI it holds as a business associate, it will notify the covered entity as the BAA and 45 C.F.R. § 164.410 require so the clinic can notify patients and HHS when those rules apply.`,
        ],
      },
      {
        heading: "Request a BAA",
        paragraphs: [`Clinics ready to discuss a production agreement and BAA should write to ${contact}.`],
      },
    ],
  };
}

function choicesDoc(entity: string, contact: string): LegalDocument {
  return {
    id: "choices",
    title: "Your Privacy Choices",
    kicker: "CCPA, CPRA, and similar laws",
    intro: `${entity} does not sell personal information and does not share it for cross-context behavioral advertising. This page is the opt-out and consumer-rights notice for California and other U.S. state privacy laws that use similar terms.`,
    sections: [
      {
        heading: "Do not sell or share",
        paragraphs: [
          "We do not sell personal information. We do not share personal information for cross-context behavioral advertising. You do not need to submit an opt-out to stop a sale that does not occur. If that ever changes, this page and the cookie banner will offer a control before any such sharing begins.",
        ],
      },
      {
        heading: "Rights you may have",
        paragraphs: ["Depending on your state, you may have the right to:"],
        bullets: [
          "Know the categories and specific pieces of personal information we collected.",
          "Access, correct, or delete personal information.",
          "Opt out of sale, sharing, or targeted advertising — which we do not perform on this site.",
          "Limit use of sensitive personal information.",
          "Not be discriminated against for exercising a privacy right.",
        ],
      },
      {
        heading: "How to exercise a right",
        paragraphs: [
          `Email ${contact} with your request, your state, and how we can verify you. We will not require a new account. We will describe any verification we need. An authorized agent may submit a request with proof of authority.`,
          "Patients asking about a dental record should also contact the treating practice. That practice controls the designated record set.",
        ],
      },
      {
        heading: "Appeals",
        paragraphs: [
          `If we deny a request, you may appeal by writing again to ${contact} with the word Appeal in the subject. If you remain unsatisfied, your state attorney general may accept a complaint.`,
        ],
      },
      {
        heading: "Cookie preference",
        paragraphs: [
          "Use the cookie banner or Change cookie preference on the Cookie Policy page. Necessary storage is required to remember that choice.",
        ],
      },
    ],
  };
}

export function legalDocument(id: LegalPageId): LegalDocument {
  const entity = legalEntity();
  const contact = privacyContactLine();
  const jurisdiction = legalJurisdiction();
  if (id === "privacy") {
    return privacyDoc(entity, contact);
  }
  if (id === "npp") {
    return nppDoc(entity, contact);
  }
  if (id === "terms") {
    return termsDoc(entity, contact, jurisdiction);
  }
  if (id === "cookies") {
    return cookiesDoc(entity);
  }
  if (id === "accessibility") {
    return accessibilityDoc(entity, contact);
  }
  if (id === "disclaimer") {
    return disclaimerDoc(entity);
  }
  if (id === "hipaa") {
    return hipaaDoc(entity, contact);
  }
  return choicesDoc(entity, contact);
}
