import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);
  const expanded = expandEmpty(parsed);

  console.log(expanded.join("\n"));

  const galaxies = getAllGalaxies(expanded);

  console.log("galaxies", galaxies.length);
  console.log("combinations", getCombinations(galaxies, galaxies).length);

  const distances = getCombinations<[number, number]>(galaxies, galaxies).map(
    ([a, b]) => {
      return shortestPath(a, b);
    }
  );
  console.log(distances.reduce((a, b) => a + b, 0));
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines;
}

function getCombinations<T>(a: T[], b: T[]): [T, T][] {
  const combinations: [T, T][] = [];

  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < b.length; j++) {
      if (i !== j) combinations.push([a[i], b[j]]);
    }
  }

  return combinations;
}

function shortestPath(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function getAllGalaxies(input: string[]) {
  const galaxies = [] as [number, number][];

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input[i].length; j++) {
      if (input[i][j] === "#") {
        galaxies.push([j, i]);
      }
    }
  }

  return galaxies;
}

function expandEmptyColumns(input: string[]) {
  const columnsToExpand = [] as number[];

  for (let col = 0; col < input[0].length; col++) {
    let allDots = true;

    for (let row = 0; row < input.length; row++) {
      if (input[row][col] !== ".") {
        allDots = false;
        break;
      }
    }

    if (allDots) {
      columnsToExpand.push(col);
    }
  }
  let expanded = [...input];

  for (let i = 0; i < columnsToExpand.length; i++) {
    // add i for previous expansions
    const col = columnsToExpand[i] + i;

    expanded = expanded.map(
      (line) => line.slice(0, col) + "." + line.slice(col)
    );
  }

  return expanded;
}
function expandEmptyRows(input: string[]) {
  const rowsToExpand = [] as number[];

  for (let row = 0; row < input.length; row++) {
    if (input[row].includes("#")) {
      continue;
    }
    rowsToExpand.push(row);
  }
  const expanded = [...input];

  for (let i = 0; i < rowsToExpand.length; i++) {
    // add i for previous expansions
    const row = rowsToExpand[i] + i;

    expanded.splice(row, 0, ".".repeat(input[0].length));
  }

  return expanded;
}

function expandEmpty(input: string[]) {
  return expandEmptyRows(expandEmptyColumns(input));
}

main();

//
// Tests
//
// Deno.test("simpl", () => {
//   // assertEquals(  );
// });
Deno.test("shortestPath", () => {
  assertEquals(shortestPath([1, 6], [5, 11]), 9);
});
Deno.test("getAllGalaxies", () => {
  const source = expandEmpty(parseFile(example));

  const target = [
    [4, 0],
    [9, 1],
    [0, 2],
    [8, 5],
    [1, 6],
    [0, 11],
    [5, 11],
  ];

  assertArrayIncludes(getAllGalaxies(source), target);
});
Deno.test("expandEmpty", () => {
  const source = parseFile(example);
  const target = `
....#........
.........#...
#............
.............
.............
........#....
.#...........
............#
.............
.............
.........#...
#....#.......
`;

  assertEquals(expandEmpty(source).join("-"), parseFile(target).join("-"));
});
Deno.test("expandEmptyColumns", () => {
  const source = parseFile(example);

  const target = `
....#........
.........#...
#............
.............
........#....
.#...........
............#
.............
.........#...
#....#.......
`;

  assertArrayIncludes(expandEmptyColumns(source), parseFile(target));
});
Deno.test("expandEmptyRows", () => {
  const source = parseFile(example);

  const target = `
...#......
.......#..
#.........
..........
..........
......#...
.#........
.........#
..........
..........
.......#..
#...#.....
`;

  assertArrayIncludes(expandEmptyRows(source), parseFile(target));
});
