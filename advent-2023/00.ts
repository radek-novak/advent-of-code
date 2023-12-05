import {
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

async function main() {
  const file = await Deno.readTextFile("input.txt");
  const lines = file.trim().split("\n");
}

main();

//
// Tests
//
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("simpl", () => {
  // assertEquals(  );
});
