import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

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
