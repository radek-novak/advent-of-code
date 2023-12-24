import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

//
// Solution
//
type Field = string[];
type Point = [number, number];
type SegmentRange = { start: Point; end: Point; length: number };

const DIODES = ["^", "v", "<", ">"];

function findStart(input: Field): Point {
  for (let i = 0; i < input[0].length; i++) {
    if (input[0][i] === ".") {
      return [i, 0];
    }
  }

  throw new Error("No start found");
}
function findEnd(input: Field): Point {
  for (let i = 0; i < input[0].length; i++) {
    if (input[input.length - 1][i] === ".") {
      return [i, input.length - 1];
    }
  }

  throw new Error("No start found");
}

class Segment {
  points: Point[] = [];
  nextStarts: Point[] = [];

  constructor(private field: Field, public start: Point, public end: Point) {}

  getNeighbors(point: Point): Point[] {
    const input = this.field;
    const [x, y] = point;

    // if (DIODES.includes(input[y][x])) {
    //   return [this.forceDiodeDirection([x, y], input[y][x])];
    // }

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ] as Point[];

    return neighbors.filter(([x, y]) => {
      if (x < 0 || y < 0) return false;
      if (y >= input.length || x >= input[0].length) return false;
      if (input[y][x] === "#") return false;
      if (this.points.some((p) => p[0] === x && p[1] === y)) {
        return false;
      }
      // if (DIODES.includes(input[y][x])) {
      //   return this.checkDiode(point, [x, y]);
      // }

      return true;
    });
  }

  private checkDiode(prev: Point, current: Point): boolean {
    const [px, py] = prev;
    const [cx, cy] = current;
    const diode = this.field[cy][cx];

    if (diode === "^") {
      return px === cx && cy < py;
    } else if (diode === "v") {
      return px === cx && cy > py;
    } else if (diode === "<") {
      return py === cy && px < cx;
    } else if (diode === ">") {
      return py === cy && cx > px;
    }

    throw new Error("Invalid diode " + diode);
  }
  forceDiodeDirection([x, y]: Point, diode: string): Point {
    if (diode === "^") {
      return [x, y - 1];
    } else if (diode === "v") {
      return [x, y + 1];
    } else if (diode === "<") {
      return [x - 1, y];
    } else if (diode === ">") {
      return [x + 1, y];
    }

    throw new Error("Invalid diode " + diode);
  }

  walk() {
    let current = this.start;
    this.points.push(current);

    while (current[0] !== this.end[0] || current[1] !== this.end[1]) {
      const neighbors = this.getNeighbors(current);

      if (neighbors.length === 0) {
        console.error("No neighbors found", current);
        break;
      }

      if (neighbors.length > 1) {
        this.nextStarts.push(...neighbors);
        break;
      }

      current = neighbors[0];
      this.points.push(...neighbors);
    }
  }

  getSegmentRange() {
    return {
      start: this.points[0],
      end: this.points.at(-1)!,
      length: this.points.length,
    };
  }

  print() {
    const copy = [...this.field];
    for (let i = 0; i < this.field.length; i++) {
      const line = this.field[i];
      for (let j = 0; j < line.length; j++) {
        if (this.points.some((p) => p[0] === j && p[1] === i)) {
          copy[i] = copy[i].substring(0, j) + "O" + copy[i].substring(j + 1);
        }
      }
    }

    console.log(copy.join("\n"));
    console.log("-".repeat(this.field[0].length));
  }
}

function findSegments(field: Field) {
  const start = findStart(field);
  const end = findEnd(field);

  // console.log(start);
  // console.log(end);

  const segments: Segment[] = [];
  const points = [start];
  while (points.length) {
    // if (i++ > 5) break;
    const point = points.shift()!;

    const segment = new Segment(field, point, end);
    segment.walk();
    // segment.print();

    segments.push(segment);
    points.push(
      ...segment.nextStarts.filter(
        (np) => !points.some((existingPoint) => vecEq(np, existingPoint))
      )
    );
  }

  return { segments: segments.map((s) => s.getSegmentRange()), start, end };
}

function findStartSegment(segments: SegmentRange[], end: Point) {
  return segments.filter((seg) => vecDist(seg.start, end) === 1);
}

// euclidean distance
function vecDist(a: Point, b: Point): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function vecEq(a: Point, b: Point): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

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

//
//
//

const example = `
#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  // const parsed = parseFile(file);
  const parsed = parseFile(example);

  const { segments, start, end: puzzleEnd } = findSegments(parsed);

  const paths: SegmentRange[][] = [[segments[0]]];
  const finalizedPaths: SegmentRange[][] = [];
  console.log(segments);
  while (paths.length) {
    const path = paths.shift()!;
    const end = path.at(-1)!.end;
    if (vecEq(end, puzzleEnd)) {
      finalizedPaths.push(path);

      continue;
    }

    // find start path for this end
    const foundSegments = findStartSegment(segments, end);
    paths.push(...foundSegments.map((seg) => [...path, seg]));
  }

  const lengths = finalizedPaths.map(
    (path) => path.reduce((acc, cur) => acc + cur.length, 0) - 1
  );
  // console.log(finalizedPaths);
  console.log("Part I.:", Math.max(...lengths));
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines;
}

main();
