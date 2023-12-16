import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

async function main() {
  // const file = await Deno.readTextFile("input.txt");
  const file = await Deno.readTextFile("example.txt");

  const parsed = parseFile(file);

  print(parsed);

  const sum = traceLight(parsed);

  console.log(sum);
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.trim().split(""));

  for (const line of lines) {
    if (line.length !== lines[0].length) {
      throw new Error(`Invalid input, L${line}`);
    }
  }

  return lines;
}
type Mirror = "/" | "|" | "\\" | "-";
type Ray = {
  dir: [number, number];
  pos: [number, number];
};

function traceLight(input: string[][]) {
  const rays: Ray[] = [
    {
      pos: [0, 0],
      dir: [1, 0],
    },
  ];

  type HistKey = `${number}-${number}:${number}-${number}`;
  const history = new Set<HistKey>();

  let i = 0;
  while (rays.length > 0) {
    const ray = rays[0];
    // push ray in the dir
    ray.pos[0] += ray.dir[0];
    ray.pos[1] += ray.dir[1];
    // if ray is out of bounds, remove it
    if (
      ray.pos[0] < 0 ||
      ray.pos[0] >= input[0].length ||
      ray.pos[1] < 0 ||
      ray.pos[1] >= input.length
    ) {
      rays.shift();
      continue;
    }
    // if ray is in history, remove it
    const rayKey: HistKey = `${ray.dir[0]}-${ray.dir[1]}:${ray.pos[0]}-${ray.pos[1]}`;

    if (history.has(rayKey)) {
      rays.shift();
      continue;
    }

    // record history
    history.add(rayKey);

    // if ray is on mirror, change and/or add dir
    const char = input[ray.pos[1]][ray.pos[0]] as Mirror | ".";

    const newRay = rayColl(char, ray);
    if (newRay) {
      rays.push(newRay);
    }

    console.log(rays.map((r) => `${r.pos[0]},${r.pos[1]}`));
  }

  // postprocess history to only consider positions
  const positions = new Set<`${number}-${number}`>();

  for (const hist of history) {
    const [, pos] = hist.split(":");
    positions.add(pos as `${number}-${number}`);
  }

  return positions.size;
}

function getDir(dir: [number, number]): "L" | "R" | "U" | "D" {
  if (dir[0] === 0) {
    return dir[1] === 1 ? "D" : "U";
  } else {
    return dir[0] === 1 ? "R" : "L";
  }
}

// mutate and possibly return new one
function rayColl(mirror: Mirror | ".", ray: Ray): Ray | null {
  const direction = getDir(ray.dir);

  let newRay = null as Ray | null;

  switch (mirror) {
    case ".":
      break;
    case "/":
      if (direction === "U") {
        ray.dir[0] = 1;
        ray.dir[1] = 0;
      } else if (direction === "R") {
        ray.dir[0] = 0;
        ray.dir[1] = 1;
      } else if (direction === "D") {
        ray.dir[0] = -1;
        ray.dir[1] = 0;
      } else if (direction === "L") {
        ray.dir[0] = 0;
        ray.dir[1] = -1;
      }
      break;
    case "\\":
      if (direction === "U") {
        ray.dir[0] = -1;
        ray.dir[1] = 0;
      } else if (direction === "R") {
        ray.dir[0] = 0;
        ray.dir[1] = 1;
      } else if (direction === "D") {
        ray.dir[0] = 1;
        ray.dir[1] = 0;
      } else if (direction === "L") {
        ray.dir[0] = 0;
        ray.dir[1] = -1;
      }
      break;
    case "|":
      if (direction === "R" || direction === "L") {
        ray.dir[0] = 0;
        ray.dir[1] = -1;

        newRay = {
          pos: [ray.pos[0], ray.pos[1] + 1],
          dir: [0, 1],
        };
      }
      break;
    case "-":
      if (direction === "U" || direction === "D") {
        ray.dir[0] = -1;
        ray.dir[1] = 0;

        newRay = {
          pos: [ray.pos[0] + 1, ray.pos[1]],
          dir: [1, 0],
        };
      }
      break;
    default:
      throw new Error(`Invalid mirror: ${mirror}`);
  }

  ray.pos[0] += ray.dir[0];
  ray.pos[1] += ray.dir[1];

  return newRay;
}

function print(input: string[][]) {
  for (const line of input) {
    console.log(line.join(""));
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
Deno.test("arr", () => {
  // assertArrayIncludes
});
