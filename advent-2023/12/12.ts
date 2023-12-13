import { generateCombinations } from "./generateCombinations.ts";
import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const finalExample = `
#.#.### 1,1,3
.#...#....###. 1,1,3
.#.###.#.###### 1,3,1,6
####.#...#... 4,1,1
#....######..#####. 1,6,5
.###.##....# 3,2,1
`;

const example = `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1
`;

type Row = { springs: string; counts: number[] };

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);
  // const parsed = parseFile(file).map(fiveTimeRow);
  // const parsed = parseFile(example).map(fiveTimeRow);

  let sum = 0;
  for (const row of parsed) {
    const combinations = findMissing(row);
    const missing = findUnfinished(row.springs);

    for (const combo of generateCombinations(missing.length, combinations)) {
      const newSprings = applyCombination(row.springs, combo);
      if (validateRow({ springs: newSprings, counts: row.counts })) {
        // console.log(newSprings);

        sum++;
      }
    }
  }
  console.log(sum);
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  const reRow = /^([.#?]+) ([\d,]+)$/;

  const parsedLines = lines.map((line) => {
    const match = line.trim().match(reRow);

    if (!match) throw new Error(`Invalid line: ${line}`);

    const [_, springs, countsString] = match;

    return { springs, counts: countsString.split(",").map(Number) };
  });

  return parsedLines;
}

function countConsecutives(springs: string): number[] {
  if (springs.includes("?")) {
    throw new Error("unfinished input");
  }
  const counts: number[] = [];
  let current = 0;

  for (let i = 0; i < springs.length; i++) {
    if (springs[i] === ".") {
      if (current > 0) {
        counts.push(current);
        current = 0;
      }

      continue;
    }
    if (springs[i] === "#") {
      current++;
    }
  }
  if (current > 0) {
    counts.push(current);
  }

  return counts;
}

function findUnfinished(springs: string): number[] {
  const unfinished: number[] = [];

  for (let i = 0; i < springs.length; i++) {
    if (springs[i] === "?") {
      unfinished.push(i);
    }
  }

  return unfinished;
}

function findMissing(row: Row) {
  let existing = 0;

  for (let i = 0; i < row.springs.length; i++) {
    if (row.springs[i] === "#") {
      existing++;
    }
  }

  return row.counts.reduce((a, b) => a + b, 0) - existing;
}

function validateRow(row: Row): boolean {
  const counts = countConsecutives(row.springs);

  return counts.every((count, i) => count === row.counts[i]);
}

function applyCombination(springs: string, combination: number[]): string {
  let result = "";

  for (let i = 0; i < springs.length; i++) {
    if (springs[i] === "?") {
      result += combination.shift() === 1 ? "#" : ".";
    } else {
      result += springs[i];
    }
  }

  return result;
}

function fiveTimeRow(row: Row) {
  return {
    springs: row.springs.repeat(5),
    counts: Array.from({ length: 5 }).flatMap(() => row.counts),
  };
}

main();

//
// Tests
//
Deno.test("applyCombination", () => {
  const springs = "???.###";
  const combination = [1, 0, 1];

  assertEquals(applyCombination(springs, combination), "#.#.###");
});
Deno.test("applyCombination 2", () => {
  const springs = "?.?.?###";
  const combination = [1, 0, 1];

  assertEquals(applyCombination(springs, combination), "#...####");
});
Deno.test("applyCombination 3", () => {
  assertEquals(
    applyCombination("?#?#?#?#?#?#?#?", [1, 0, 1]),
    "##.###.#.#.#.#."
  );
  assertEquals(
    applyCombination("?#?#?#?#?#?#?#?", [1, 0, 1, 0, 1, 0, 1, 1]),
    "##.###.###.####"
  );
});

Deno.test("countConsecutives", () => {
  const springs = ".#.###.#.######";
  const target = [1, 3, 1, 6];

  const actual = countConsecutives(springs);
  assertEquals(actual[0], target[0]);
  assertEquals(actual[1], target[1]);
  assertEquals(actual[2], target[2]);
  assertEquals(actual[3], target[3]);
});
Deno.test("validateRow 1", () => {
  const row = { springs: ".#.###.#.######", counts: [1, 3, 1, 6] };

  assertEquals(validateRow(row), true);
});
Deno.test("validateRow 1", () => {
  const row = { springs: ".#.###.#.######", counts: [1, 3, 2, 6] };

  assertEquals(validateRow(row), false);
});
