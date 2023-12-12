import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
// 1,1
// 1

// 2,2
// 11

// 3,1
// 100
// 010
// 001

// 2,1
// 10
// 01

// 3,2
// 110
// 101
// 011

// 4,3
// 1110
// 1101
// 1011
// 0111

// 4,2
// 1100
// 1010
// 1001
// 0110
// 0101
// 0011
export function generateCombinations(n: number, k: number): (0 | 1)[][] {
  // all ones (also [[]])
  if (n === k) return [[...Array(n)].map(() => 1)];

  const result = [] as (0 | 1)[][];

  if (n > 0 && k > 0) {
    result.push(
      ...generateCombinations(n - 1, k - 1).map<(0 | 1)[]>((c) => [1, ...c])
    );
  }

  if (n > 0 && n > k) {
    result.push(
      ...generateCombinations(n - 1, k).map<(0 | 1)[]>((c) => [0, ...c])
    );
  }

  return result;
}

Deno.test("generateCombinations", () => {
  assertArrayIncludes(generateCombinations(1, 1), [[1]]);
  assertArrayIncludes(generateCombinations(2, 1), [
    [1, 0],
    [0, 1],
  ]);
  assertArrayIncludes(generateCombinations(4, 2), [
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
  ]);
  assertArrayIncludes(generateCombinations(5, 1), [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
});
