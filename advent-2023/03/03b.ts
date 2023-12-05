import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PartNumber, getPartNumbers } from "./03.ts";

type Coord = [number, number];

async function main() {
  const file = await Deno.readTextFile("input.txt");
  const lines = file.split("\n");

  const partNumbers = getPartNumbers(lines);

  const gearCoords = getGears(lines);

  let sum = 0;

  for (const gearCoord of gearCoords) {
    const gear = getGearIfValid(lines, gearCoord);

    if (gear.length !== 2) continue;

    const [a, b] = gear;

    sum += findInParts(partNumbers, a) * findInParts(partNumbers, b);
  }

  console.log(sum);
}

main();

const reDigit = /\d/;
function isNumber(lines: string[], coord: Coord) {
  const [x, y] = coord;
  const line = lines[y];

  if (line === undefined) return false;

  const val = line[x];

  return reDigit.test(val);
}

function getGearIfValid(lines: string[], coords: Coord) {
  const [x, y] = coords;
  const validNumbers = [] as Coord[];

  if (isNumber(lines, [x, y - 1])) {
    validNumbers.push([x, y - 1]);
  } else {
    // only check corners if middle is not a number
    if (isNumber(lines, [x - 1, y - 1])) {
      validNumbers.push([x - 1, y - 1]);
    }

    if (isNumber(lines, [x + 1, y - 1])) {
      validNumbers.push([x + 1, y - 1]);
    }
  }

  if (isNumber(lines, [x, y + 1])) {
    validNumbers.push([x, y + 1]);
  } else {
    // only check corners if middle is not a number
    if (isNumber(lines, [x - 1, y + 1])) {
      validNumbers.push([x - 1, y + 1]);
    }

    if (isNumber(lines, [x + 1, y + 1])) {
      validNumbers.push([x + 1, y + 1]);
    }
  }

  if (isNumber(lines, [x - 1, y])) {
    validNumbers.push([x - 1, y]);
  }

  if (isNumber(lines, [x + 1, y])) {
    validNumbers.push([x + 1, y]);
  }

  return validNumbers.length === 2 ? validNumbers : [];
}

function getGears(lines: string[]) {
  const gearCoords = lines.map((line, lineIndex) => {
    const matchAll = line.matchAll(/\*/g);
    const gearCoords = [] as Coord[];

    for (const partNumberString of matchAll) {
      const start = partNumberString.index;

      if (!start) throw new Error("No start");

      gearCoords.push([start, lineIndex]);
    }

    return gearCoords;
  });

  return gearCoords.flat();
}

function findInParts(parts: PartNumber[], coord: Coord): number {
  const [x, y] = coord;

  const foundPart = parts.find(
    (part) => part.line === y && part.start <= x && part.end >= x
  );

  if (!foundPart) throw new Error("No part found");

  return Number(foundPart.part);
}

//
// Tests
//
Deno.test("getGears", () => {
  const lines = `
467..114..
...*......
..35..633.
......#...
617*......
.......58.
..592.....
......755.
...$......
.664.598..`
    .trim()
    .split("\n")
    .map((line) => line.trim());

  const gearCoords = getGears(lines);
  assertArrayIncludes(gearCoords, [
    [3, 1],
    [3, 4],
  ]);
});

Deno.test("validateGear", () => {
  const lines = `
467..114..
...*......
..35..633.
......#...
617*......
.......58.
..592.....
......755.
...$......
.664.598..`
    .trim()
    .split("\n")
    .map((line) => line.trim());

  assertArrayIncludes(getGearIfValid(lines, [3, 1]), [
    [2, 0],
    [3, 2],
  ]);
  assertArrayIncludes(getGearIfValid(lines, [3, 4]), []);
});
Deno.test("validateGear 2", () => {
  const lines = `
467..114..
...*......
..35..633.
..3.4.#...
...*......
.......58.
..592.....
...*..755.
...$......
.664.598..`
    .trim()
    .split("\n")
    .map((line) => line.trim());

  assertEquals(getGearIfValid(lines, [3, 4]), [
    [2, 3],
    [4, 3],
  ]);
});
Deno.test("findInParts", () => {
  const parts = [
    { part: "467", line: 0, start: 0, end: 3 },
    { part: "114", line: 0, start: 5, end: 8 },
    { part: "35", line: 2, start: 2, end: 4 },
  ];

  assertEquals(findInParts(parts, [1, 0]), 467);
  assertEquals(findInParts(parts, [2, 0]), 467);
  assertEquals(findInParts(parts, [5, 0]), 114);
});
