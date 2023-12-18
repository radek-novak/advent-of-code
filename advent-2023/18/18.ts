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
  console.log(parsed);

  const t = new Tunnel(parsed);

  t.buildWalls();
  t.print();
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
class Tunnel {
  field: string[][];
  cur: [number, number];
  instrDirs = {
    R: [1, 0],
    L: [-1, 0],
    U: [0, -1],
    D: [0, 1],
  } as const;

  constructor(public instructions: TInstr[], forcedSize?: [number, number]) {
    this.cur = [0, 0];

    const { start, size } = this.determineStart();
    this.field = new Array(forcedSize ? forcedSize[1] : size[1])
      .fill(0)
      .map(() => new Array(forcedSize ? forcedSize[0] : size[0]).fill("."));
  }

  determineStart() {
    let l = 0;
    let r = 0;
    let u = 0;
    let d = 0;

    for (let instr of this.instructions) {
      const { dir, len } = instr;

      switch (dir) {
        case "U":
          u += len;
          break;
        case "D":
          d += len;
          break;
        case "L":
          l += len;
          break;
        case "R":
          r += len;
          break;
      }
    }
    const start = [l + r + 1, u + d + 1];

    return {
      start,
      size: [start[0] * 2, start[1] * 2],
    };
  }

  addWall(from: [number, number], to: [number, number]) {
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

  buildWalls() {
    this.instructions.forEach((instr) => this.addInstruction(instr));
  }

  print() {
    console.log(this.field.map((row) => row.join("")).join("\n"));
  }
}

main();

//
// Tests
//
Deno.test("simpl", () => {
  // assertEquals(  );
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("addwall", () => {
  const parsed = parseFile(example);
  const t = new Tunnel(parsed, [10, 10]);

  t.addWall([1, 2], [4, 2]);
  t.addWall([6, 3], [6, 8]);
  // t.print();
  assertEquals(t.field[2].join(""), ".####.....");
});
Deno.test("addwall", () => {
  const parsed = parseFile(example);
  const t = new Tunnel(parsed, [10, 10]);

  t.addWall([4, 2], [1, 2]);
  // t.print();
  assertEquals(t.field[2].join(""), ".####.....");
});
