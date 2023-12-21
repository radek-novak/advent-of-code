import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

// % -> Flip Flop
// & -> Inverter

const example = `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

async function main() {
  // const file = await Deno.readTextFile("input.txt");

  // const parsed = parseFile(file);
  const parsed = parseFile(example);

  const circuit = buildCircuit(parsed);
  console.log(circuit);
}

main();

//
// Solution
//
type FlipFlop = {
  name: string;
  state: 0 | 1;
  output: string[];
};
type Conjunction = {
  name: string;
  inputMemory: Record<string, 0 | 1>;
  output: string[];
};
type Broadcaster = {
  name: string;
  output: string[];
};

type TPulse = 0 | 1;
type TSignal = {
  pulse: TPulse;
  target: string;
};

type TModule = {
  type: "%" | "&" | "broadcaster";
  state: 0 | 1;
  output: string[];
};

type TCircuit = Record<string, TModule>;

type Instruction = {
  from: { type: "broadcaster" | "%" | "&"; name: string };
  to: string[];
};

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  const instructions = lines.map((line) => {
    const [from, to] = line.split("->");

    const fromModule = from.trim();
    const toModules = to
      .trim()
      .split(", ")
      .map((m) => m.trim());

    return {
      from:
        fromModule === "broadcaster"
          ? { type: "broadcaster", name: "broadcast" }
          : { type: fromModule[0] as "%" | "&", name: fromModule.slice(1) },
      to: toModules,
    };
  });

  return instructions as Instruction[];
}

function buildCircuit(instructions: Instruction[]) {
  const circuit: TCircuit = {};

  for (const instr of instructions) {
    circuit[instr.from.name] = {
      type: instr.from.type,
      state: 0,
      output: instr.to,
    };
  }

  return circuit;
}

function processButtonPress(circuit: TCircuit) {
  const signals: TSignal[] = circuit.broadcast.output.map((target) => ({
    pulse: 0,
    target,
  }));
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
