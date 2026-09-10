const JUNK = [
  "you",
  "the",
  "yeah",
  "yes",
  "um",
  "uh",
  "a",
  "ah",
  "oh",
  "okay",
  "thank you",
  "thanks",
  "thanks for watching",
  "thank you for watching",
  "subtitle",
  "subtitles",
  "go to",
  "music",
  "applause",
];

const PERIO_WORDS = [
  "tooth",
  "number",
  "facial",
  "buccal",
  "lingual",
  "palatal",
  "distal",
  "mesial",
  "canine",
  "molar",
  "wisdom",
  "premolar",
  "incisor",
  "bleeding",
  "watch",
  "recession",
  "mobility",
  "furcation",
  "correction",
  "on",
];

function hasDigit(text: string): boolean {
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") {
      return true;
    }
  }
  return false;
}

function lettersAndDigits(text: string): string {
  let out = "";
  let lastSpace = true;
  for (const ch of text.toLowerCase()) {
    const isLetter = ch >= "a" && ch <= "z";
    const isDigit = ch >= "0" && ch <= "9";
    if (isLetter || isDigit) {
      out += ch;
      lastSpace = false;
      continue;
    }
    if (!lastSpace) {
      out += " ";
      lastSpace = true;
    }
  }
  return out.trim();
}

export function isUsableTranscript(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return false;
  }

  const lower = lettersAndDigits(trimmed);
  for (const junk of JUNK) {
    if (lower === junk) {
      return false;
    }
  }

  if (hasDigit(lower)) {
    return true;
  }

  for (const word of PERIO_WORDS) {
    if (lower.includes(word)) {
      return true;
    }
  }

  return false;
}
