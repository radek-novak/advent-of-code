import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  let sum = 0;
  for (const block of parsed) {
    const val = evalBlock(block);
    // console.log(val);
    sum += val;
  }
  console.log(sum);
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  const blocks: string[][] = [];

  let runningBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") {
      blocks.push([...runningBlock]);
      runningBlock = [];
    } else {
      runningBlock.push(line);
    }
  }

  blocks.push(runningBlock);

  return blocks;
}

// for first part: 0, second part: 1
const START_BUDGET = 1;

// index of the bottom reflective line
function blockHorizontalReflection(block: string[]): number {
  for (let i = 1; i < block.length; i++) {
    let budget = START_BUDGET;
    for (let a = i - 1, b = i; ; a--, b++) {
      if (a < 0 || b >= block.length) {
        if (budget === 0) return i;
        break;
      }

      const lineA = block[a];
      const lineB = block[b];

      const diffCount = stringDiffCount(lineA, lineB);
      budget -= diffCount;
      if (budget < 0) {
        break;
      }
    }

    budget = 1;
  }

  return -1;
}

function blockVerticalReflection(block: string[]): number {
  const transposed = transposeMatrix(block);
  const res = blockHorizontalReflection(transposed);

  return res;
}

function evalBlock(block: string[]): number {
  const hor = blockHorizontalReflection(block);
  if (hor === -1) {
    return blockVerticalReflection(block);
  }

  return 100 * hor;
}

function transposeMatrix(matrix: string[]): string[] {
  const newMatrix: string[] = [];

  for (let col = 0; col < matrix[0].length; col++) {
    let newLine = "";
    for (let line = 0; line < matrix.length; line++) {
      newLine += matrix[line][col];
    }

    newMatrix.push(newLine);
  }

  return newMatrix;
}

function stringDiffCount(a: string, b: string) {
  let diff = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diff++;
    }
  }

  return diff;
}

main();

//
// Tests
//
Deno.test("compareStringsWithOneDiff", () => {
  assertEquals(stringDiffCount("..##...#.", "..##..##."), 1);
  assertEquals(stringDiffCount("#.##..##.", "..##..##."), 1);
  assertEquals(stringDiffCount("#.##..##.", "...#..##."), 2);
});
Deno.test("blockHorizontalReflection", () => {
  const parsed = parseFile(example);

  const hor = blockHorizontalReflection(parsed[1]);
  assertEquals(hor, 4);
});
Deno.test("blockVerticalReflection", () => {
  const parsed = parseFile(example);

  const vert = blockVerticalReflection(parsed[0]);
  assertEquals(vert, 5);
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("transposeMatrix", () => {
  const matrix = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.  
`
    .trim()
    .split("\n")
    .map((line) => line.trim());

  assertArrayIncludes(transposeMatrix(matrix), [
    "#.##..#",
    "..##...",
    "##..###",
    "#....#.",
    ".#..#.#",
    ".#..#.#",
    "#....#.",
    "##..###",
    "..##...",
  ]);
});
