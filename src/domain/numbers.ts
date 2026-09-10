const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  to: 2,
  too: 2,
  three: 3,
  four: 4,
  for: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  twentyone: 21,
  twentytwo: 22,
  twentythree: 23,
  twentyfour: 24,
  twentyfive: 25,
  twentysix: 26,
  twentyseven: 27,
  twentyeight: 28,
  twentynine: 29,
  thirty: 30,
  thirtyone: 31,
  thirtytwo: 32,
};

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let current = "";

  for (const ch of text.toLowerCase()) {
    const isLetter = ch >= "a" && ch <= "z";
    const isDigit = ch >= "0" && ch <= "9";
    if (isLetter || isDigit) {
      current += ch;
      continue;
    }
    if (ch === "-") {
      continue;
    }
    if (current.length > 0) {
      tokens.push(current);
      current = "";
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

export function tokenToNumber(token: string): number | undefined {
  if (token.length === 0) {
    return undefined;
  }

  let allDigits = true;
  for (const ch of token) {
    if (ch < "0" || ch > "9") {
      allDigits = false;
      break;
    }
  }

  if (allDigits) {
    return Number(token);
  }

  return WORD_TO_NUMBER[token];
}

export function numberAt(tokens: string[], index: number): { value: number; width: number } | undefined {
  const token = tokens[index];
  if (!token) {
    return undefined;
  }

  const next = tokens[index + 1];
  if (token === "twenty" && next) {
    const ones = tokenToNumber(next);
    if (ones !== undefined && ones >= 1 && ones <= 9) {
      return { value: 20 + ones, width: 2 };
    }
  }
  if (token === "thirty" && next) {
    const ones = tokenToNumber(next);
    if (ones !== undefined && ones >= 1 && ones <= 2) {
      return { value: 30 + ones, width: 2 };
    }
  }

  const value = tokenToNumber(token);
  if (value === undefined) {
    return undefined;
  }
  return { value, width: 1 };
}

export function phraseHas(tokens: string[], words: string[]): boolean {
  const needed = words.join(" ");
  const hay = tokens.join(" ");
  return hay.includes(needed);
}

export function indexOfPhrase(tokens: string[], words: string[]): number {
  if (words.length === 0) {
    return -1;
  }
  for (let i = 0; i <= tokens.length - words.length; i += 1) {
    let match = true;
    for (let j = 0; j < words.length; j += 1) {
      if (tokens[i + j] !== words[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }
  return -1;
}
