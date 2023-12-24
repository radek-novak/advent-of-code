import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

//
// Solution
//
type Vector3 = [number, number, number];
type Vector = [number, number];
type Line = [Vector, Vector];
type Line3 = [Vector3, Vector3];

function line3to2(line: Line3): Line {
  const [a, b] = line;
  return [a.slice(0, 2) as Vector, b.slice(0, 2) as Vector];
}

// ax + c = bx + d
function findLineIntersect([p1, [dx1, dy1]]: Line, [p2, [dx2, dy2]]: Line) {
  const a = dy1 / dx1;
  const b = dy2 / dx2;
  const c = p1[1] - a * p1[0];
  const d = p2[1] - b * p2[0];

  const x = (d - c) / (a - b);
  const y = a * x + c;

  return [x, y] as Vector;
}

function intersectInRange(
  l1: Line,
  l2: Line,
  [from, to]: [number, number]
): boolean {
  const intersect = findLineIntersect(l1, l2);
  const [x, y] = intersect;

  if (
    pointDist(vecAdd(l1[0], l1[1]), intersect) > pointDist(l1[0], intersect)
  ) {
    return false;
  }
  if (
    pointDist(vecAdd(l2[0], l2[1]), intersect) > pointDist(l2[0], intersect)
  ) {
    return false;
  }

  return x >= from && x <= to && y >= from && y <= to;
}

function vecAdd([a1, a2]: Vector, [b1, b2]: Vector): Vector {
  return [a1 + b1, a2 + b2];
}
function vecSub([a1, a2]: Vector, [b1, b2]: Vector): Vector {
  return [a1 - b1, a2 - b2];
}
function pointDist([a1, a2]: Vector, [b1, b2]: Vector): number {
  return Math.sqrt((a1 - b1) ** 2 + (a2 - b2) ** 2);
}

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
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  const TEST_RANGE = [200000000000000, 400000000000000] as Vector;
  // const parsed = parseFile(example);
  // const EXAMPLE_RANGE = [7, 27];

  const lines = parsed.map(line3to2);

  let countIn = 0;
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const intersect = intersectInRange(lines[i], lines[j], TEST_RANGE);

      if (intersect) {
        countIn++;
      }
    }
  }

  console.log("Part I.:", countIn);
}

// 19, 13, 30 @ -2,  1, -2
function parseFile(input: string) {
  const inputLines = input.trim().split("\n");

  const lines: Line3[] = [];

  for (const line of inputLines) {
    const [pointStr, velocityStr] = line.split(" @ ");

    const point = pointStr.split(", ").map(Number) as Vector3;
    const velocity = velocityStr.split(", ").map(Number) as Vector3;

    lines.push([point, velocity] as Line3);
  }

  return lines;
}

main();
