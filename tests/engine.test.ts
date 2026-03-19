import { describe, test, expect, beforeAll } from "bun:test";
import init, { Engine } from "../pkg/phonetik_js.js";
import { readFileSync } from "fs";
import { resolve } from "path";

let engine: InstanceType<typeof Engine>;

beforeAll(async () => {
  // In Node/Bun we load the WASM from disk. In browsers this would be
  // a fetch() to the .wasm URL — the default init() handles that.
  const wasmPath = resolve(import.meta.dir, "../pkg/phonetik_js_bg.wasm");
  const wasmBytes = readFileSync(wasmPath);
  await init({ module_or_path: wasmBytes });
  engine = new Engine();
});

describe("construction", () => {
  test("word count is substantial", () => {
    expect(engine.wordCount()).toBeGreaterThan(100_000);
  });
});

describe("lookup", () => {
  test("known word returns object", () => {
    const info = engine.lookup("hello");
    expect(info).toBeDefined();
    expect(info.word).toBe("HELLO");
    expect(info.phonemes).toEqual(["HH", "AH0", "L", "OW1"]);
    expect(info.syllableCount).toBe(2);
    expect(info.syllables.length).toBe(2);
    expect(info.variantCount).toBeGreaterThanOrEqual(1);
  });

  test("case insensitive", () => {
    const a = engine.lookup("Cat");
    const b = engine.lookup("CAT");
    const c = engine.lookup("cat");
    expect(a.word).toBe(b.word);
    expect(b.word).toBe(c.word);
  });

  test("unknown word returns undefined", () => {
    expect(engine.lookup("xyzzyplugh")).toBeUndefined();
  });
});

describe("contains", () => {
  test("known and unknown", () => {
    expect(engine.contains("hello")).toBe(true);
    expect(engine.contains("xyzzyplugh")).toBe(false);
  });
});

describe("syllable counting", () => {
  test("known words", () => {
    expect(engine.syllableCount("cat")).toBe(1);
    expect(engine.syllableCount("hello")).toBe(2);
    expect(engine.syllableCount("beautiful")).toBe(3);
  });

  test("unknown word estimates", () => {
    expect(engine.syllableCount("blarglesnarf")).toBeGreaterThanOrEqual(1);
  });

  test("batch counting", () => {
    const results = engine.syllableCounts(["hello world", "the cat"]);
    expect(results.length).toBe(2);
    expect(results[0].total).toBeGreaterThanOrEqual(3);
    expect(results[1].total).toBeGreaterThanOrEqual(2);
  });
});

describe("rhymes", () => {
  test("perfect rhymes for cat", () => {
    const matches = engine.perfectRhymes("cat");
    expect(matches.length).toBeGreaterThan(0);
    const words = matches.map((m: any) => m.word);
    expect(words).toContain("BAT");
    for (const m of matches) {
      expect(m.rhymeType).toBe("perfect");
    }
  });

  test("slant rhymes return results", () => {
    const matches = engine.slantRhymes("love", 20);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.rhymeType).toBe("slant");
    }
  });

  test("near rhymes return results", () => {
    const matches = engine.nearRhymes("night", 20);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.rhymeType).toBe("near");
    }
  });

  test("merged rhymes respects limit", () => {
    const matches = engine.rhymes("the", 10);
    expect(matches.length).toBeLessThanOrEqual(10);
  });

  test("merged rhymes deduplicates", () => {
    const matches = engine.rhymes("cat", 200);
    const words = matches.map((m: any) => m.word);
    const unique = new Set(words);
    expect(unique.size).toBe(words.length);
  });
});

describe("scansion", () => {
  test("iambic pentameter", () => {
    const scan = engine.scan("uneasy lies the head that wears the crown");
    expect(scan.syllableCount).toBe(10);
    expect(scan.meter.name).toContain("iambic");
    expect(scan.meter.footType).toBe("iamb");
    expect(scan.meter.regularity).toBe(1.0);
    expect(scan.visual).toBe("x / x / x / x / x /");
  });

  test("dictionary mode preserves function word stress", () => {
    const spoken = engine.scan("shall I compare thee to a summer's day");
    const dict = engine.scan("shall I compare thee to a summer's day", "dictionary");
    // Dictionary mode should have more stressed syllables
    const spokenStressed = spoken.binaryPattern.filter((b: number) => b === 1).length;
    const dictStressed = dict.binaryPattern.filter((b: number) => b === 1).length;
    expect(dictStressed).toBeGreaterThan(spokenStressed);
  });

  test("empty line", () => {
    const scan = engine.scan("");
    expect(scan.syllableCount).toBe(0);
    expect(scan.binaryPattern.length).toBe(0);
  });

  test("binary pattern values are 0 or 1", () => {
    const scan = engine.scan("hello world");
    for (const b of scan.binaryPattern) {
      expect(b === 0 || b === 1).toBe(true);
    }
  });
});

describe("compare", () => {
  test("rhyming pair", () => {
    const cmp = engine.compare("cat", "bat");
    expect(cmp).toBeDefined();
    expect(cmp.similarity).toBeGreaterThan(0.5);
    expect(cmp.rhymeType).toBe("perfect");
  });

  test("unknown word returns undefined", () => {
    expect(engine.compare("cat", "xyzzyplugh")).toBeUndefined();
  });
});

describe("rhyme map", () => {
  test("detects patterns in couplet", () => {
    const result = engine.rhymeMap([
      "the cat sat on the mat",
      "the bat sat on the hat",
    ]);
    expect(result.lines.length).toBe(2);
    expect(result.words.length).toBeGreaterThan(0);
    expect(result.patterns.length).toBeGreaterThan(0);
  });
});
