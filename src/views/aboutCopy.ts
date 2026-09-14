export const aboutEyebrow = "About MolarMind";
export const aboutHeroLead = "The exam is already happening out loud.";
export const aboutHeroAccent = "The software should keep up.";
export const aboutLede =
  "I built MolarMind for the three people who share an operatory: the hygienist calling the numbers, the doctor who has to trust the chart, and the patient who deserves to understand their own mouth.";

export const aboutWhyTitle = "Why I built it";
export const aboutWhy = [
  "A periodontal exam is a conversation. The hygienist is in the mouth, probe in one hand, scaler in the other, calling tooth numbers and six-site readings the way they were trained. Somewhere, those numbers are supposed to become a chart. The patient is hearing “pockets” and “bleeding.” The doctor will walk in a few minutes later and inherit whatever made it onto the screen.",
  "That gap is not a people problem. It is a tools problem. The visit is live. The record, the plan, and the explanation usually happen later — after the hygienist looks up, after someone types, after the patient has already nodded along.",
  "I wanted one exam, in three languages, at the same moment: numbers for the hygienist, a structured chart for the doctor, and a plain picture for the person in the chair. Eyes stay on the mouth. The doctor keeps their time for the plan. The patient leaves knowing why a tooth is a watch, or why it needs care.",
] as const;

export const aboutQuote = "The chart should keep up with the conversation — not the other way around.";
export const aboutSignoff = "— Nikhil";

export const aboutRolesTitle = "Who it is for";
export const aboutRoles = [
  {
    id: "hygienist",
    role: "Hygienist",
    title: "Keep your eyes in the mouth",
    body: "Charting should sound like the visit you are already doing. Speak the tooth, then the numbers. MolarMind fills the grid while you scale and probe.",
    uses: [
      "Call sites the way you already do: “Number fourteen. Three two three.”",
      "See the perio grid fill in real time, including bleeding and recession.",
      "Correct a reading out loud instead of hunting for a cell.",
      "Finish the visit with the chart already done — not a pile of typing after the patient leaves.",
    ],
  },
  {
    id: "doctor",
    role: "Doctor",
    title: "Walk in to a chart you can trust",
    body: "The exam should be complete before you sit down. Same findings the hygienist just called — structured, reviewable, ready for the plan.",
    uses: [
      "Open a finished perio grid, not a half-typed note.",
      "See healthy, watch, and needs-care teeth at a glance.",
      "Spend the consult on treatment, not reconstructing probing.",
      "Preview how the exam would land in Open Dental without sending anything from this demo.",
    ],
  },
  {
    id: "patient",
    role: "Patient",
    title: "See what the numbers mean",
    body: "You should not have to decode “5 mm DB on #14.” MolarMind shows your teeth, in your mouth, in everyday language.",
    uses: [
      "Watch your own jaw update as the hygienist works.",
      "Hear “the pocket behind your upper left molar got deeper since March,” not a string of abbreviations.",
      "Understand the difference between a watch and a tooth that needs care.",
      "Leave with a take-home of what was found today.",
    ],
  },
] as const;

export const aboutCloseTitle = "Listen. Chart. Explain. Together.";
export const aboutCloseBody =
  "This is a chairside demo. Speech is transcribed in the browser. Charting is a deterministic parser, not a guessing model. Nothing is written to a live practice-management system. The point is to prove the visit can stay one visit — for everyone in the room.";
export const aboutPatientLabel = "See the patient view";
