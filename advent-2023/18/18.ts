import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  const t = new Tunnel(parsed);

  t.buildWalls();
  // t.print();

  console.log("Part I.:", t.innerSize());
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");
  // const reline = /^[RLUD] \d+ \(\#[a-f1-9]{6}$/;
  return lines.map((line) => {
    const [dir, len, color] = line.trim().split(" ");

    // if (!reline.test(line)) {
    //   throw new Error(`Invalid line: ${line}`);
    // }

    return {
      dir,
      len: Number(len),
      color: color.replace("(", "").replace(")", ""),
    } as TInstr;
  });
}

type TInstr = {
  dir: "U" | "D" | "L" | "R";
  len: number;
  color: string;
};

type Point = [number, number];
type Wall = [Point, Point];

class Tunnel {
  field: string[][];
  cur: [number, number];
  walls: Wall[] = [];
  instrDirs = {
    R: [1, 0],
    L: [-1, 0],
    U: [0, -1],
    D: [0, 1],
  } as const;
  start: Point;

  constructor(public instructions: TInstr[]) {
    this.cur = [0, 0];

    this.planWalls();

    const { start, size } = this.calculateSize();
    this.start = start;
    this.field = this.createField(size);
  }

  calculateSize() {
    if (this.walls.length === 0) {
      throw new Error("run planWalls first");
    }

    const xVals = this.walls.map(([[x1], [x2]]) => [x1, x2]).flat();
    const yVals = this.walls.map(([[, y1], [, y2]]) => [y1, y2]).flat();

    const minX = Math.min(...xVals) - 1;
    const maxX = Math.max(...xVals) + 1;
    const minY = Math.min(...yVals) - 1;
    const maxY = Math.max(...yVals) + 1;

    const size = [maxX - minX + 1, maxY - minY + 1] as [number, number];

    return {
      size,
      start: [minX, minY] as Point,
    };
  }

  addWall(from: [number, number], to: [number, number]) {
    this.walls.push([from, to]);
  }

  createField(size: [number, number]) {
    return new Array(size[1]).fill(0).map(() => new Array(size[0]).fill("."));
  }

  buildWall(from: [number, number], to: [number, number]) {
    const [x1, y1] = from;
    const [x2, y2] = to;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.field[y][x] = "#";
      }
    }
  }

  addInstruction(instr: TInstr) {
    const [x, y] = this.cur;
    const { dir, len } = instr;

    const [dx, dy] = this.instrDirs[dir];

    const [x2, y2] = [x + dx * len, y + dy * len];

    this.addWall([x, y], [x2, y2]);

    this.cur = [x2, y2];
  }

  planWalls() {
    this.instructions.forEach((instr) => this.addInstruction(instr));
  }

  buildWalls() {
    for (const [from, to] of this.walls) {
      this.buildWall(subVec(from, this.start), subVec(to, this.start));
    }
  }

  bucketOuterCount() {
    const visited = new Set<string>();

    const queue = [[0, 0]];

    while (queue.length) {
      const [x, y] = queue.shift() as Point;

      const key = `${x},${y}`;

      if (visited.has(key)) continue;

      visited.add(key);

      if (this.field[y][x] === "#") continue;

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ].filter(([x, y]) => {
        return (
          x >= 0 &&
          y >= 0 &&
          x < this.field[0].length &&
          y < this.field.length &&
          this.field[y][x] === "." &&
          !visited.has(`${x},${y}`)
        );
      });

      queue.push(...neighbors);
    }
    return visited.size;
  }

  innerSize() {
    return this.field[0].length * this.field.length - this.bucketOuterCount();
  }

  print() {
    console.log(this.field.map((row) => row.join("")).join("\n"));
  }
}
function subVec(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] - b[0], a[1] - b[1]];
}
main();

//
// Tests
//
Deno.test("addwall", () => {
  const parsed = parseFile(example);
  const t = new Tunnel(parsed);

  t.buildWall([1, 2], [4, 2]);
  t.buildWall([6, 3], [6, 8]);
  // t.print();
  assertEquals(t.field[2].join(""), ".####....");
});
Deno.test("addwall", () => {
  const parsed = parseFile(example);
  const t = new Tunnel(parsed);

  t.buildWall([4, 2], [1, 2]);
  // t.print();
  assertEquals(t.field[2].join(""), ".####....");
});
