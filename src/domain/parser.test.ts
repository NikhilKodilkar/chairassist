import { describe, expect, it } from "vitest";
import { PARSER_CASES, runParserCase } from "./parser.cases";

describe("perio parser", () => {
  it("covers the utterance cases", () => {
    expect(PARSER_CASES.length).toBe(51);
  });

  PARSER_CASES.forEach((parserCase) => {
    it(parserCase.name, () => {
      const result = runParserCase(parserCase);
      expect(result.passed, result.detail).toBe(true);
    });
  });
});
