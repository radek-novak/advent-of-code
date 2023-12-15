import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  const hashes = parsed.map(runningHash);

  const sum = hashes.reduce((a, b) => a + b, 0);
  console.log(sum);
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split(",")
    .map((line) => line.trim());

  return lines;
}

main();

function runningHash(s: string): number {
  let hash = 0;

  for (let i = 0; i < s.length; i++) {
    hash += s.charCodeAt(i);
    hash *= 17;
    hash %= 256;
  }

  return hash;
}

//
// Tests
//
Deno.test("runningHash", () => {
  assertEquals(runningHash("H"), 200);
  assertEquals(runningHash("HA"), 153);
  assertEquals(runningHash("HASH"), 52);
});
Deno.test("runningHash", () => {
  assertEquals(runningHash("H"), 200);
  assertEquals(runningHash("HA"), 153);
  assertEquals(runningHash("HASH"), 52);
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("arr", () => {
  // assertArrayIncludes
});
