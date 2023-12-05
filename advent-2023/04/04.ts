import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

//   const file = `
// Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
// Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
// Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
// Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
// Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
// Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const lines = file.trim().split("\n");

  let sum = 0;

  for (const line of lines) {
    const { winning, mine } = parseLine(line);

    const winningSet = new Set(winning);
    const mineSet = new Set(mine);
    const intersect = setIntersection(winningSet, mineSet);

    const matches = intersect.size;

    if (matches < 1) continue;

    sum += 2 ** (matches - 1);
  }

  console.log(sum);
}

async function main2() {
  const file = await Deno.readTextFile("input.txt");

  const lines = file.trim().split("\n");

  const copyCounts = Array.from({ length: lines.length }).fill(1) as number[];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { winning, mine } = parseLine(line);

    const winningSet = new Set(winning);
    const mineSet = new Set(mine);
    const intersect = setIntersection(winningSet, mineSet);

    const matches = intersect.size;
    // console.log({ matches, copyCounts });
    for (let j = i + 1; j <= i + matches; j++) {
      copyCounts[j] += copyCounts[i];
    }
  }

  console.log(copyCounts.reduce((a, b) => a + b, 0));
}

main();
main2();

type Card = {
  number: number;
  winning: number[];
  mine: number[];
};

function setIntersection<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((x) => b.has(x)));
}

// Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
function parseLine(line: string): Card {
  const match = line.match(/^Card\s{1,3}(\d+): ([\d ]+) \| ([\d ]+)$/);

  if (!match) throw new Error("failed to parse " + line);

  const [_, number, winning, mine] = match;

  // filter(Boolean) works because there are no 0s in the input
  return {
    number: Number(number),
    winning: winning.split(" ").filter(Boolean).map(Number),
    mine: mine.split(" ").filter(Boolean).map(Number),
  };
}

//
// Tests
//
Deno.test("parse 1", () => {
  const line = `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53`;

  const { number, winning, mine } = parseLine(line);

  assertEquals(number, 1);
  assertArrayIncludes(winning, [41, 48, 83, 86, 17]);
  assertArrayIncludes(mine, [83, 86, 6, 31, 17, 9, 48, 53]);
});
Deno.test("parse 2", () => {
  const line = `Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1`;

  const { number, winning, mine } = parseLine(line);
  console.log(number, winning, mine);
  assertEquals(number, 3);
  assertArrayIncludes(winning, [1, 21, 53, 59, 44]);
  assertArrayIncludes(mine, [69, 82, 63, 72, 16, 21, 14, 1]);
});
