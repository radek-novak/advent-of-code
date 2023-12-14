import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  const rolled = roll(parsed);
  const counted = count(rolled);

  console.log(counted);
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.trim());

  return lines;
}

main();

function roll(board: string[]): string[] {
  const rolledBoard = board.slice();
  let rolledCount = 0;

  const obstacles = "#O";

  do {
    rolledCount = 0;

    for (let i = 1; i < rolledBoard.length; i++) {
      const lineAbove = rolledBoard[i - 1];
      const line = rolledBoard[i];
      for (let j = 0; j < line.length; j++) {
        const cell = line[j];
        const cellAbove = lineAbove[j];
        if (cell !== "O") continue;
        if (obstacles.includes(cellAbove)) continue;

        if (cellAbove === ".") {
          rolledBoard[i - 1] =
            lineAbove.slice(0, j) + "O" + lineAbove.slice(j + 1);
          rolledBoard[i] = line.slice(0, j) + "." + line.slice(j + 1);
          rolledCount++;
        }
      }
    }
  } while (rolledCount > 0);

  return rolledBoard;
}

function count(board: string[]): number {
  let sum = 0;

  for (let i = 0; i < board.length; i++) {
    for (const cell of board[i]) {
      if (cell === "O") sum += board.length - i;
    }
  }
  return sum;
}

//
// Tests
//
Deno.test("simpl", () => {
  // assertEquals(  );
});
Deno.test("roll", () => {
  const target = `
OOOO.#.O..
OO..#....#
OO..O##..O
O..#.OO...
........#.
..#....#.#
..O..#.O.O
..O.......
#....###..
#....#....
`;

  assertArrayIncludes(roll(parseFile(example)), parseFile(target));
});
Deno.test("count", () => {
  const target = `
OOOO.#.O..
OO..#....#
OO..O##..O
O..#.OO...
........#.
..#....#.#
..O..#.O.O
..O.......
#....###..
#....#....
`;

  assertEquals(count(parseFile(target)), 136);
});
Deno.test("arr", () => {
  // assertArrayIncludes
});
