import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
.....
.S-7.
.|.|.
.L-J.
.....`;

const example2 = `
-L|F7
7S-7|
L|7||
-L-J|
L|-JF`;

const example3 = `
..F7.
.FJ|.
SJ.L7
|F--J
LJ...`;

const example4 = `
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ`;

type Pipe = "S" | "J" | "L" | "F" | "|" | "-" | "7";

class Adjacency {
  graph: string[];
  distances: number[][];
  // maxDistance: number;
  w: number;
  h: number;
  start: [number, number];

  constructor(graph: string[]) {
    this.graph = graph;
    this.w = graph[0].length;
    this.h = graph.length;
    // this.maxDistance = 0;

    this.start = this.findStart();
    this.distances = Array(this.h)
      .fill(0)
      .map(() => Array(this.w).fill(Infinity));

    this.distances[this.start[1]][this.start[0]] = 0;
  }

  findStart() {
    for (let i = 0; i < this.h; i++) {
      const line = this.graph[i];

      // j = column or x
      for (let j = 0; j < this.w; j++) {
        const char = line[j];

        if (char === "S") {
          return [j, i] as [number, number];
        }
      }
    }

    throw new Error("start not found");
  }

  // getNeighbors(x: number, y: number) {
  //   const neighbors = [] as [number, number][];

  //   if (x > 0) {
  //     neighbors.push([x - 1, y]);
  //   }
  //   if (x < this.w - 1) {
  //     neighbors.push([x + 1, y]);
  //   }
  //   if (y > 0) {
  //     neighbors.push([x, y - 1]);
  //   }
  //   if (y < this.h - 1) {
  //     neighbors.push([x, y + 1]);
  //   }

  //   return neighbors;
  // }

  validatePipe(from: "L" | "R" | "U" | "D", to: Pipe | ".") {
    switch (from) {
      case "L":
        return to === "-" || to === "7" || to === "J";
      case "R":
        return to === "-" || to === "F" || to === "L";
      case "U":
        return to === "|" || to === "J" || to === "L";
      case "D":
        return to === "|" || to === "F" || to === "7";
      default:
        return false;
    }
  }

  printDistances() {
    console.log(
      this.distances
        .map((line) =>
          line.map((c) => String(c).replace("Infinity", ".")).join(" ")
        )
        .join("\n")
    );
  }

  walk() {
    const stack = [[this.start, 0]] as Parameters<Adjacency["step"]>[];

    while (stack.length) {
      const nextStep = stack.pop();

      if (!nextStep) throw new Error("no next step");

      const nextSteps = this.step(...nextStep);

      if (!nextSteps) continue;

      stack.push(...nextSteps);
    }
  }

  step(
    start: [number, number],
    distance: number,
    from?: "L" | "R" | "U" | "D"
  ) {
    const [x, y] = start;
    const pipe = this.graph[y][x] as Pipe | ".";

    // console.log([x, y], distance, from);
    // this.printDistances();

    if (from && !this.validatePipe(from, pipe)) {
      // console.log("invalid pipe", from, pipe);
      // console.log("---------");
      return;
    }

    if (this.distances[y][x] < distance) {
      // console.log("already visited", [x, y], distance, from);
      // console.log("---------");
      return;
    }

    // console.log("---------");

    this.distances[y][x] = distance;

    const nextSteps = [] as [
      start: [number, number],
      distance: number,
      from?: "L" | "R" | "U" | "D" | undefined
    ][];

    if (
      (pipe === "S" || pipe === "-" || pipe === "J" || pipe === "7") &&
      x > 0
    ) {
      // Left
      nextSteps.push([[x - 1, y], distance + 1, "R"]);
    }
    if (
      (pipe === "S" || pipe === "-" || pipe === "L" || pipe === "F") &&
      x < this.w - 1
    ) {
      // Right
      nextSteps.push([[x + 1, y], distance + 1, "L"]);
    }
    if (
      (pipe === "S" || pipe === "|" || pipe === "L" || pipe === "J") &&
      y > 0
    ) {
      // Up
      nextSteps.push([[x, y - 1], distance + 1, "D"]);
    }
    if (
      (pipe === "S" || pipe === "|" || pipe === "7" || pipe === "F") &&
      y < this.h - 1
    ) {
      // Down
      nextSteps.push([[x, y + 1], distance + 1, "U"]);
    }

    return nextSteps;
  }

  getMaxDistance() {
    return this.distances.reduce(
      (max, line) => Math.max(max, ...line.filter((c) => c !== Infinity)),
      -Infinity
    );
  }

  // print() {}
}

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example4);

  const adj = parsed.adjacency;

  adj.walk();

  // adj.printDistances();

  console.log(adj.getMaxDistance());
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.trim());

  const adj = new Adjacency(lines);

  return {
    adjacency: adj,
  };
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
Deno.test("arr", () => {
  // assertArrayIncludes
});
