import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

//
// Solution
//

//
// Tests
//
Deno.test("simple", () => {
  // assertEquals(  );
});
Deno.test("object", () => {
  // assertObjectMatch(  );
});
Deno.test("array", () => {
  // assertArrayIncludes
});

const example = `
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  // const parsed = parseFile(file);
  const parsed = parseFile(example);
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines;
}

main();
