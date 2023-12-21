import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const field = parseFile(file);
  // const field = parseFile(example);
  const start = findStart(field);
  console.log("Part I.:", step(field, start, 64));
}

type Field = string[];
type Point = [number, number];
function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines;
}

main();

//
// Solution
//

function findStart(field: Field): Point {
  for (let y = 0; y < field.length; y++) {
    const line = field[y];
    for (let x = 0; x < line.length; x++) {
      if (line[x] === "S") {
        return [x, y];
      }
    }
  }
  throw new Error("No start found");
}

function findNeighbors(field: Field, [x, y]: Point): Point[] {
  const points: Point[] = [];
  if (x > 0) {
    points.push([x - 1, y]);
  }
  if (x < field[0].length - 1) {
    points.push([x + 1, y]);
  }
  if (y > 0) {
    points.push([x, y - 1]);
  }
  if (y < field.length - 1) {
    points.push([x, y + 1]);
  }

  return points.filter((p) => isNeighborValid(field, p));
}

function isNeighborValid(field: Field, [x, y]: Point): boolean {
  try {
    return field[y][x] === "." || field[y][x] === "S";
  } catch {
    console.error("Invalid point", x, y);
    return false;
  }
}

function step(field: Field, point: Point, steps: number): number {
  let currentSteps = new Set([String(point)]);

  for (let i = 0; i < steps; i++) {
    const steps = [...currentSteps]
      .map((p) => p.split(","))
      .map((p) => [Number(p[0]), Number(p[1])] as Point);
    const newSteps = steps.flatMap((p) => findNeighbors(field, p));
    currentSteps = new Set(newSteps.map((p) => String(p)));
  }

  return currentSteps.size;
}

//
// Tests
//
Deno.test("simpl", () => {
  // assertEquals(  );
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("findStart", () => {
  const field = parseFile(example);

  assertArrayIncludes(findStart(field), [5, 5]);
});
Deno.test("findNeighbors", () => {
  const field = parseFile(example);
  const neighbors = findNeighbors(field, [5, 5]);

  assertEquals(neighbors.length, 2);
  assertArrayIncludes(neighbors, [
    [5, 4],
    [4, 5],
  ]);
});
