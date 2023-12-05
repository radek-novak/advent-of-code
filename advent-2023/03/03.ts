import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

type Range = {
  line: number;
  start: number;
  end: number;
};

export type PartNumber = {
  part: string; // convert after validation
  line: number;
  start: number;
  end: number;
};

async function main() {
  const file = await Deno.readTextFile("input.txt");
  const lines = file.split("\n");

  const partNumbers = getPartNumbers(lines);

  const validPartNumbers = partNumbers.filter((partNumber) => {
    return validatePartNumber(lines, partNumber);
  });

  const sum = validPartNumbers.reduce(
    (acc, partNumber) => acc + Number(partNumber.part),
    0
  );

  console.log(sum);
}

main();

function validatePartNumber(lines: string[], partNumber: PartNumber) {
  const fence = getFence(partNumber);

  return fence.some(([x, y]) => getXYisSymbol(lines, x, y));
}

function getXYisSymbol(lines: string[], x: number, y: number) {
  const line = lines[y];

  if (line === undefined) return false;

  const val = line[x];

  return val !== "." && val !== undefined;
}

export function getPartNumbers(lines: string[]) {
  const partNumbers = lines.map((line, index) => {
    const matchAll = line.matchAll(/(\d+)/g);
    const lineParts = [] as PartNumber[];

    for (const partNumberString of matchAll) {
      const part = partNumberString[0];
      const start = partNumberString.index;

      if (start === undefined)
        throw new Error("start is undefined" + partNumberString);

      const end = start + partNumberString[0].length - 1;

      lineParts.push({
        part,
        line: index,
        start,
        end,
      });
    }

    return lineParts;
  });

  return partNumbers.flat();
}

function getFence(range: Range): [number, number][] {
  const fence: [number, number][] = [];

  fence.push([range.start - 1, range.line]);
  fence.push([range.end + 1, range.line]);

  for (let x = range.start - 1; x <= range.end + 1; x++) {
    fence.push([x, range.line - 1]);
    fence.push([x, range.line + 1]);
  }

  return fence;
}

//
// Tests
//
Deno.test("validatePartNumber", () => {
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

  const partNumbers = getPartNumbers(lines);
  console.log(partNumbers);
  // validatePartNumber()
});
Deno.test("getFence", () => {
  //....
  //.12.
  //....
  const actual = getFence({
    line: 0,
    start: 0,
    end: 1,
  });

  assertArrayIncludes(actual, [
    [2, 0],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
    [2, -1],
    [-1, 1],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
});
Deno.test("getFence2", () => {
  const actual = getFence({ line: 139, start: 115, end: 118 });

  assertArrayIncludes(actual, [
    [114, 139],
    [114, 138],
    [115, 138],
    [116, 138],
    [117, 138],
    [118, 138],
    [119, 138],
    [114, 140],
    [115, 140],
    [116, 140],
    [117, 140],
    [118, 140],
    [119, 140],
  ]);
});
Deno.test("simpl", () => {
  // assertEquals(  );
});
