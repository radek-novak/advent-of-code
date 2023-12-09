import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  // console.log(parsed);
  // console.log(buildSequences(parsed[0]));
  // console.log(getNextInSequences(buildSequences(parsed[2])));

  const newNumbers = [] as number[];
  for (const line of parsed) {
    const sequences = buildSequences(line);

    newNumbers.push(getNextInSequences(sequences));
  }

  console.log(newNumbers.reduce((a, b) => a + b, 0));
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines.map((line) => line.trim().split(" ").map(Number));
}

function buildSequence(numbers: number[]) {
  const result = [] as number[];
  for (let i = 1; i < numbers.length; i++) {
    const diff = numbers[i] - numbers[i - 1];
    result.push(diff);
  }

  return result;
}

function buildSequences(numbers: number[]) {
  const sequences = [numbers] as number[][];

  while (!sequences.at(-1)!.every((n) => n === 0)) {
    sequences.push(buildSequence(sequences.at(-1)!));
  }

  return sequences;
}
function getNextInSequences(sequences: number[][]) {
  for (let i = sequences.length - 1; i >= 0; i--) {
    const prevSequenceValue = sequences[i + 1]?.at(-1) ?? 0;

    sequences[i].push(prevSequenceValue + sequences[i].at(-1)!);
  }

  return sequences[0].at(-1)!;
}

main();

//
// Tests
//
Deno.test("simpl", () => {
  // assertEquals(  );
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("arr", () => {
  // assertArrayIncludes
});
