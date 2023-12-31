import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

//
// Solution
//
type Vec3 = [number, number, number];
type Brick = [Vec3, Vec3];

function makeBricksFall(bricks: Brick[]): Brick[] {
  const result: Brick[] = [];

  for (const [[bx1, by1, bz1], [bx2, by2, bz2]] of bricks) {
    let z = 0;

    // for (const [[rx1, ry1], [rx2, ry2, rz2]] of result) {
    for (let i = result.length - 1; i >= 0; i--) {
      const [[rx1, ry1], [rx2, ry2, rz2]] = result[i];
      // find if the fallen brick overlaps current brick
      const xOverlap = rangeOverlap(bx1, bx2, rx1, rx2);
      const yOverlap = rangeOverlap(by1, by2, ry1, ry2);

      // console.log("overlap", xOverlap && yOverlap, z, rz2);

      if (xOverlap && yOverlap) {
        // bricks overlap
        z = rz2;

        break;
      }
    }

    const zDiff = bz2 - bz1;

    result.push([
      [bx1, by1, z + 1],
      [bx2, by2, z + 1 + zDiff],
    ]);
    result.sort((a, b) => a[1][2] - b[1][2]);
  }

  return result;
}

function rangeOverlap(a1: number, a2: number, b1: number, b2: number) {
  return a1 <= b2 && b1 <= a2;
}

function checkBricks(bricks: Brick[]): number {
  let sum = 0;

  for (let i = 0; i < bricks.length; i++) {
    const brickWithout = bricks.filter((_, j) => j !== i);
    const bricksWithoutAfter = makeBricksFall(brickWithout);

    const brickZWithout = brickWithout.map(([, [, , z]]) => z);

    const brickZWithoutAfter = bricksWithoutAfter.map(([, [, , z]]) => z);

    let diff = false;

    for (let j = 0; j < brickZWithout.length; j++) {
      if (brickZWithout[j] !== brickZWithoutAfter[j]) {
        diff = true;
        break;
      }
    }
    console.log(diff ? "fell" : "held", bricks[i]);

    sum += diff ? 0 : 1;
  }

  return sum;
}

function printBrick(brick: Brick, size: number) {
  console.log("_________");
  console.log(brick.join(" "));
  for (let x = 0; x <= size; x++) {
    let line = "";
    for (let y = 0; y <= size; y++) {
      if (
        x >= brick[0][0] &&
        x <= brick[1][0] &&
        y >= brick[0][1] &&
        y <= brick[1][1]
      ) {
        line += "#";
      } else {
        line += ".";
      }
    }
    console.log(line);
  }
}

//
// Tests
//
Deno.test("rangeOverlap", () => {
  assertEquals(rangeOverlap(1, 3, 2, 4), true);
  assertEquals(rangeOverlap(1, 3, 3, 4), true);
  assertEquals(rangeOverlap(3, 5, 2, 4), true);
  assertEquals(rangeOverlap(4, 5, 2, 4), true);
  assertEquals(rangeOverlap(5, 6, 2, 4), false);
  assertEquals(rangeOverlap(1, 2, 4, 5), false);
  assertEquals(rangeOverlap(2, 6, 3, 5), true);
  assertEquals(rangeOverlap(3, 5, 2, 6), true);
});
// Deno.test("object", () => {
//   // assertObjectMatch(  );
// });
// Deno.test("array", () => {
//   // assertArrayIncludes
// });

const example = `
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9
`;

async function main() {
  const parsed = parseFile(await Deno.readTextFile("input.txt"));
  // const parsed = parseFile(example);

  const settledBricks = makeBricksFall(parsed); //.slice(0, 33);

  // console.log(parsed);
  // console.log("-----");
  // console.log(settledBricks);

  // for (let sb of settledBricks) {
  //   printBrick(sb, 9);
  // }

  console.log(checkBricks(settledBricks));
}

function parseFile(input: string) {
  function parseBrick(input: string): Brick {
    const [a, b] = input.split("~");

    return [parseVec3(a), parseVec3(b)];
  }

  function parseVec3(input: string): Vec3 {
    return input.split(",").map((n) => parseInt(n, 10)) as Vec3;
  }
  const lines = input.trim().split("\n");

  const bricks = lines.map(parseBrick);

  bricks.sort((a, b) => a[0][2] - b[0][2]);

  return bricks;
}

main();
