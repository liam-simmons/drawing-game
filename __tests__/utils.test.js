const { replaceAt, maskWord, isCloseGuess } = require("../utils");

describe("replaceAt", () => {
  test("replaces a character in the middle", () => {
    expect(replaceAt("hello", 1, "a")).toBe("hallo");
  });

  test("replaces the first character", () => {
    expect(replaceAt("hello", 0, "H")).toBe("Hello");
  });

  test("replaces the last character", () => {
    expect(replaceAt("hello", 4, "!")).toBe("hell!");
  });

  test("works with a single-character string", () => {
    expect(replaceAt("x", 0, "y")).toBe("y");
  });

  test("handles underscore reveal (game use case)", () => {
    expect(replaceAt("_____", 2, "a")).toBe("__a__");
  });
});

describe("maskWord", () => {
  test("masks every letter with underscores", () => {
    expect(maskWord("cat")).toBe("___");
  });

  test("preserves spaces between words", () => {
    expect(maskWord("hot dog")).toBe("___ ___");
  });

  test("preserves hyphens", () => {
    expect(maskWord("t-shirt")).toBe("_-_____");
  });

  test("handles a word with both a space and a hyphen", () => {
    expect(maskWord("pin-up boy")).toBe("___-__ ___");
  });

  test("returns an empty string for an empty input", () => {
    expect(maskWord("")).toBe("");
  });

  test("single character word", () => {
    expect(maskWord("a")).toBe("_");
  });
});

describe("isCloseGuess", () => {
  test("returns true for one wrong character (same length)", () => {
    expect(isCloseGuess("cot", "cat")).toBe(true);
  });

  test("returns true for one missing character", () => {
    expect(isCloseGuess("catt", "cat")).toBe(true);
  });

  test("returns true for one extra character", () => {
    expect(isCloseGuess("cat", "cart")).toBe(true);
  });

  test("returns false for exact match", () => {
    expect(isCloseGuess("cat", "cat")).toBe(false);
  });

  test("returns false for more than one differing character", () => {
    expect(isCloseGuess("dog", "cat")).toBe(false);
  });

  test("is case-insensitive and trims spaces", () => {
    expect(isCloseGuess("  CaTt ", "cat")).toBe(true);
  });
});
