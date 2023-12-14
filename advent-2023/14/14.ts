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

  const rolled = rollUp(parsed);
  const counted = count(rolled);

  console.log("Part 1:", counted);

  console.log("Part 2:", count(rollCycles(parsed)));
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.trim());

  return lines;
}

main();

function rollUp(board: string[]): string[] {
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
function rollDown(board: string[]): string[] {
  const rolledBoard = board.slice();
  let rolledCount = 0;

  const obstacles = "#O";

  do {
    rolledCount = 0;

    for (let i = 0; i < rolledBoard.length - 1; i++) {
      const lineBelow = rolledBoard[i + 1];
      const line = rolledBoard[i];
      for (let j = 0; j < line.length; j++) {
        const cell = line[j];
        const cellBelow = lineBelow[j];
        if (cell !== "O") continue;
        if (obstacles.includes(cellBelow)) continue;

        if (cellBelow === ".") {
          rolledBoard[i + 1] =
            lineBelow.slice(0, j) + "O" + lineBelow.slice(j + 1);
          rolledBoard[i] = line.slice(0, j) + "." + line.slice(j + 1);
          rolledCount++;
        }
      }
    }
  } while (rolledCount > 0);

  return rolledBoard;
}
function rollLeft(board: string[]): string[] {
  const rolledBoard = board.slice();
  let rolledCount = 0;

  const obstacles = "#O";

  do {
    rolledCount = 0;

    for (let i = 0; i < rolledBoard.length; i++) {
      const line = rolledBoard[i];
      for (let j = 1; j < line.length; j++) {
        const cell = line[j];
        const cellLeft = line[j - 1];
        if (cell !== "O") continue;
        if (obstacles.includes(cellLeft)) continue;

        if (cellLeft === ".") {
          rolledBoard[i] = line.slice(0, j - 1) + "O." + line.slice(j + 1);
          rolledCount++;
        }
      }
    }
  } while (rolledCount > 0);

  return rolledBoard;
}
function rollRight(board: string[]): string[] {
  const rolledBoard = board.slice();
  let rolledCount = 0;

  const obstacles = "#O";

  do {
    rolledCount = 0;

    for (let i = 0; i < rolledBoard.length; i++) {
      const line = rolledBoard[i];
      for (let j = 0; j < line.length - 1; j++) {
        const cell = line[j];
        const cellRight = line[j + 1];
        if (cell !== "O") continue;
        if (obstacles.includes(cellRight)) continue;

        if (cellRight === ".") {
          rolledBoard[i] = line.slice(0, j) + ".O" + line.slice(j + 2);
          rolledCount++;
        }
      }
    }
  } while (rolledCount > 0);

  return rolledBoard;
}

function rollCycles(board: string[]) {
  const b2b = new Map<string, string>();
  let lastBoardStr = board.join("-");
  let cycle = 0;

  while (true) {
    if (cycle === 1_000_000_000) {
      break;
    }

    const nextBoard = b2b.get(lastBoardStr)!;
    if (nextBoard) {
      lastBoardStr = nextBoard;

      cycle++;
      continue;
    }

    let innerBoard = lastBoardStr.split("-");
    innerBoard = rollUp(innerBoard);
    innerBoard = rollLeft(innerBoard);
    innerBoard = rollDown(innerBoard);
    innerBoard = rollRight(innerBoard);

    const innerBoardStr = innerBoard.join("-");

    b2b.set(lastBoardStr, innerBoardStr);

    lastBoardStr = innerBoardStr;
    cycle++;
  }

  return lastBoardStr.split("-");
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
Deno.test("rollUp", () => {
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

  assertArrayIncludes(rollUp(parseFile(example)), parseFile(target));
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
