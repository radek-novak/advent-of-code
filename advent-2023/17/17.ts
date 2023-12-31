import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { MinHeap } from "./MinHeap.ts";

const example = `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`;

class Path {
  path: number[];
  // width: number;

  constructor(
    readonly points: number[],
    readonly width: number,
    path: number[]
  ) {
    // this.points = points;
    this.width = width;
    this.path = path;
  }

  getCurrent() {
    return this.path[this.path.length - 1];
  }

  getNextValidPaths(): Path[] {
    const result = [
      this.maybeGetLeftPath(),
      this.maybeGetRightPath(),
      this.maybeGetContinuedPath(),
    ];
    return result.filter(Boolean) as Path[];
  }

  maybeGetLeftPath(): Path | null {
    const [x, y] = this.getXY(this.getCurrent());
    const [dx, dy] = this.getDirection();

    const nextCoord = [x, y] as [number, number];

    // up or down
    if (dx === 0) {
      nextCoord[0] += dy;
    } else if (dy === 0) {
      nextCoord[1] += dx;
    }

    if (this.inBounds(...nextCoord) && !this.isVisited(...nextCoord)) {
      return new Path(this.points, this.width, [
        ...this.path,
        this.getIdxCoord(...nextCoord),
      ]);
    }

    return null;
  }

  maybeGetRightPath(): Path | null {
    const [x, y] = this.getXY(this.getCurrent());
    const [dx, dy] = this.getDirection();

    const nextCoord = [x, y] as [number, number];

    // up or down
    if (dx === 0) {
      nextCoord[0] -= dy;
    } else if (dy === 0) {
      nextCoord[1] -= dx;
    }

    if (this.inBounds(...nextCoord) && !this.isVisited(...nextCoord)) {
      return new Path(this.points, this.width, [
        ...this.path,
        this.getIdxCoord(...nextCoord),
      ]);
    }

    return null;
  }

  maybeGetContinuedPath(): Path | null {
    if (!this.checkCapacity()) {
      // console.log("capacity");
      return null;
    }

    const [x, y] = this.getXY(this.getCurrent());

    const [dx, dy] = this.getDirection();
    const nextCoord = [x + dx, y + dy] as [number, number];
    // console.log({ x, y, dx, dy, nextCoord });
    if (this.inBounds(...nextCoord) && !this.isVisited(...nextCoord)) {
      return new Path(this.points, this.width, [
        ...this.path,
        this.getIdxCoord(...nextCoord),
      ]);
    }

    return null;
  }

  getDirection(): [number, number] {
    if (this.path.length < 2) return [1, 0];
    const [prev, cur] = this.path.slice(-2).map((n) => this.getXY(n));

    return subVec(cur, prev) as [number, number];
  }

  isVisited(x: number, y: number) {
    return this.path.includes(this.getIdxCoord(x, y));
  }

  inBounds(x: number, y: number) {
    const height = this.points.length / this.width;
    return x >= 0 && x < this.width && y >= 0 && y < height;
  }

  getIdxCoord(x: number, y: number) {
    return y * this.width + x;
  }

  getXY(n: number) {
    return [n % this.width, Math.floor(n / this.width)] as [number, number];
  }

  checkCapacity() {
    const maxInOneDirection = 3;

    if (this.path.length < maxInOneDirection) return true;

    const lastThree = this.path
      .slice(-(maxInOneDirection + 1), -1)
      .map((n) => this.getXY(n));

    const dir = this.getDirection();

    const directions: [number, number][] = [];

    for (let i = 1; i < lastThree.length; i++) {
      const [x, y] = subVec(lastThree[i], lastThree[i - 1]);
      directions.push([x, y]);
    }

    return !directions.every((coord) => eqVec(coord, dir));
  }

  isDone() {
    return this.path[this.path.length - 1] === this.points.length - 1;
  }

  calculateCost() {
    return this.path.slice(1).reduce((acc, cur) => acc + this.points[cur], 0);
  }

  calculateDistanceFromEnd() {
    const current = this.getXY(this.getCurrent());
    const end = this.getXY(this.points.length - 1);

    return Math.abs(current[0] - end[0]) + Math.abs(current[1] - end[1]);
  }

  pathToString() {
    return this.path.join(",");
  }

  static fromVisited(points: number[], width: number, s: string) {
    return new Path(points, width, s.split(",").map(Number));
  }

  valueOf() {
    return this.calculateDistanceFromEnd() * 5.4 + this.calculateCost();
  }

  repr() {
    // return this.path.slice(-4).join("-").toString();
    const p = this.path;
    return `${p[p.length - 1] || 0},${p[p.length - 2] || 0},${
      p[p.length - 3] || 0
    },${p[p.length - 4] || 0}`;
    // if (this.points.length < 5) return null;
    // const step = 1_000_000;

    // let repr = 0;
    // for (let i = 1; i < 5; i++) {
    //   const n = this.points.at(-i);
    //   if (n) {
    //     repr += n * step ** i;
    //   }
    // }

    // return repr;
  }
}

class Graph {
  array: number[];
  w: number;
  h: number;
  // shortestPathToPoint = new Map<number, Path>();

  constructor(private readonly nested: number[][]) {
    this.array = nested.flat();
    this.w = nested[0].length;
    this.h = nested.length;
  }

  get(x: number, y: number) {
    return this.array[y * this.w + x];
  }

  walk() {
    const activePaths = new MinHeap<Path>([new Path(this.array, this.w, [0])]);
    // const activePaths: Path[] = [new Path(this.array, this.w, [0])];
    const visitedVal = new Map<string, number>();

    const finished: Path[] = [];
    let lowest = Infinity;
    let checked = 0;
    console.time("checked");
    while (!activePaths.isEmpty()) {
      if (checked % 100000 === 0) {
        console.timeEnd("checked");
        console.time("checked");
        console.log("lowest:", lowest, "checked:", checked);
      }
      checked++;

      const path = activePaths.remove()!;
      const cost = path.calculateCost();

      // const path = activePaths.pop()!;

      if (path.isDone()) {
        if (cost < lowest) {
          lowest = cost;
          finished.push(path);
          console.log("finished:", finished.length, "lowest:", lowest);
        }

        continue;
      }
      const repr = path.repr();
      if (visitedVal.has(repr)) {
        const prevMax = visitedVal.get(repr)!;
        if (prevMax > cost) {
          visitedVal.set(repr, cost);
        } else {
          continue;
        }
      } else {
        visitedVal.set(repr, cost);
      }

      const nextValidPaths = path
        .getNextValidPaths()
        .filter(
          (path) =>
            path.calculateCost() + path.calculateDistanceFromEnd() - 1 <= lowest
        );

      for (const p of nextValidPaths) {
        activePaths.add(p);
      }
    }

    console.log("lowest:", lowest, "checked:", checked);
  }

  printVisited(visited: Set<string>) {
    const visitedArray = [...visited].map((v) =>
      v
        .split(",")
        .map(Number)
        .map((n) => [n % this.w, Math.floor(n / this.w)])
    );

    for (const path of visitedArray) {
      const nested = this.nested.map((row) => row.slice().map(() => "."));

      path.forEach(([x, y]) => {
        nested[y][x] =
          Number(nested[y][x]) < 0 ? String(Number(nested[y][x]) + 1) : "1";
      });

      console.log(nested.map((row) => row.join("")).join("\n"));

      console.log("-".repeat(15));
    }
  }

  getXY(n: number) {
    return [n % this.w, Math.floor(n / this.w)] as [number, number];
  }

  print() {
    console.log(this.nested.map((row) => row.join("")).join("\n"));
  }
}

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);
  // console.log(parsed.flat().reduce((a, b) => a + b) / parsed.flat().length);
  const g = new Graph(parsed);
  g.walk();
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");
  const nested = lines.map((line) => line.trim().split("").map(Number));

  return nested;
}

function subVec(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] - b[0], a[1] - b[1]];
}

function eqVec(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

main();

//
// Tests
//
Deno.test("Path", () => {
  const parsed = parseFile(example);

  const p1 = new Path(parsed.flat(), parsed[0].length, [0, 1, 2, 3]);
  const nextValidPaths = p1.getNextValidPaths();
  const p2 = nextValidPaths[0];

  assertEquals(p1.getXY(p1.getCurrent())[0], 3);
  assertEquals(p1.getXY(p1.getCurrent())[1], 0);
  assertEquals(p1.getIdxCoord(0, 0), 0);
  assertEquals(p1.getIdxCoord(3, 0), 3);
  assertEquals(p1.getIdxCoord(0, 2), p1.width * 2);
  assertEquals(p1.getIdxCoord(2, 3), p1.width * 3 + 2);
  assertEquals(p1.checkCapacity(), false);

  assertEquals(nextValidPaths.length, 1);

  assertEquals(p2.checkCapacity(), true);
  assertArrayIncludes(p2.path, [0, 1, 2, 3, 3 + p2.width]);

  assertEquals(p1.calculateCost(), 8);
  assertEquals(p2.calculateCost(), 13);
});
Deno.test("Path.getNextValidPaths()", () => {
  const parsed = parseFile(example);

  const p1 = new Path(
    parsed.flat(),
    parsed[0].length,
    [0, 1].map((n) => n + parsed[0].length)
  );
  const nextValidPaths = p1.getNextValidPaths();
  assertEquals(nextValidPaths.length, 3);
});
Deno.test("Path.getNextValidPaths() 2", () => {
  const parsed = parseFile(example);

  const p1 = new Path(
    parsed.flat(),
    parsed[0].length,
    [0, 1, 2, 15, 16, 17, 18]
  );
  const nextValidPaths = p1.getNextValidPaths();
  assertEquals(nextValidPaths.length, 2);

  // const p2 = nextValidPaths[1];

  // console.log(p2.getNextValidPaths().map((p) => p.path));
});
Deno.test("Path: end", () => {
  const parsed = parseFile(example);
  const parsedArr = parsed.flat();

  const p1 = new Path(parsedArr, parsed[0].length, [
    0,
    1,
    2,
    parsedArr.length - 1,
  ]);
  const p2 = new Path(parsedArr, parsed[0].length, [
    0,
    1,
    2,
    parsedArr.length - 3,
    parsedArr.length - 2,
  ]);

  assertEquals(p1.isDone(), true);
  assertEquals(p2.isDone(), false);
  const paths = p2.getNextValidPaths();
  assertEquals(paths[0].isDone() || paths[1].isDone(), true);
  assertEquals(paths[0].isDone() && paths[1].isDone(), false);
});
Deno.test("Path: valueOf", () => {
  assertEquals(new Path([9, 8, 7, 4], 2, [0, 1]).valueOf(), 13);
  assertEquals(`${Number(new Path([9, 8, 7, 4], 2, [0, 1])) + 1}`, "14");
});
