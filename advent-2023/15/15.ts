import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`;

type Lens = {
  label: string;
  focalLength: number;
};

type LensOp =
  | {
      op: string;
      focalLength: number;
      opHash: number;
      arg: string;
    }
  | {
      op: string;
      opHash: number;
      arg: string;
      focalLength?: undefined;
    };

class Box {
  lenses: Lens[] = [];
  labelToIdx: Record<string, number> = {};
  n: number;

  constructor(n: number) {
    this.n = n;
  }

  newLens(lensOp: LensOp) {
    if (lensOp.arg === "=") {
      this.addLens(lensOp.op, lensOp.focalLength!);
    } else if (lensOp.arg === "-") {
      this.removeLens(lensOp.op);
    } else {
      throw new Error(`Invalid lensOp: ${lensOp}`);
    }
  }

  private addLens(label: string, focalLength: number) {
    const idx = this.labelToIdx[label];
    if (idx !== undefined) {
      this.lenses[idx].focalLength = focalLength;
      return;
    }
    this.lenses.push({ label, focalLength });
    this.labelToIdx[label] = this.lenses.length - 1;
  }

  private removeLens(label: string) {
    const idx = this.labelToIdx[label];
    if (idx === undefined) {
      return;
    }
    this.lenses.splice(idx, 1);

    // push all the following indices down
    for (let i = idx; i < this.lenses.length; i++) {
      this.labelToIdx[this.lenses[i].label] = i;
    }
    delete this.labelToIdx[label];
  }

  getFocalLength() {
    return this.lenses.reduce((acc, cur, i) => {
      // console.log(cur.focalLength, i, this.n);
      return acc + (this.n + 1) * (i + 1) * cur.focalLength;
    }, 0);
  }
}

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  // Part 1
  // const hashes = parsed.map(runningHash);
  // const sum = hashes.reduce((a, b) => a + b, 0);
  // console.log(sum);

  // Part 2
  const boxes = Array.from({ length: 256 })
    .fill(0)
    .map((_, i) => new Box(i));
  const lensOps = parseOperations(parsed);

  for (const lensOp of lensOps) {
    // console.log(lensOp.op, lensOp.arg);
    const box = boxes[lensOp.opHash];

    box.newLens(lensOp);
  }

  console.log(boxes.reduce((acc, cur) => acc + cur.getFocalLength(), 0));
}

function parseFile(input: string) {
  const lines = input
    .trim()
    .split(",")
    .map((line) => line.trim());

  return lines;
}

function parseOperations(parsed: string[]) {
  const operations = parsed.map((line) => {
    if (line.includes("=")) {
      const [op, focalLength] = line.split("=");

      return {
        op,
        focalLength: Number(focalLength),
        opHash: runningHash(op),
        arg: "=",
      };
    } else if (line.includes("-")) {
      const op = line.replace("-", "");

      return {
        op,
        opHash: runningHash(op),
        arg: "-",
      };
    } else {
      throw new Error(`Invalid line: ${line}`);
    }
  });

  return operations;
}

main();

function runningHash(s: string): number {
  let hash = 0;

  for (let i = 0; i < s.length; i++) {
    hash += s.charCodeAt(i);
    hash *= 17;
    hash %= 256;
  }

  return hash;
}

//
// Tests
//
Deno.test("runningHash", () => {
  assertEquals(runningHash("H"), 200);
  assertEquals(runningHash("HA"), 153);
  assertEquals(runningHash("HASH"), 52);
});
Deno.test("runningHash", () => {
  assertEquals(runningHash("H"), 200);
  assertEquals(runningHash("HA"), 153);
  assertEquals(runningHash("HASH"), 52);
});
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("arr", () => {
  // assertArrayIncludes
});
