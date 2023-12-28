import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  Broadcaster,
  Conjunction,
  Counter,
  FlipFlop,
  MachineModule,
  Output,
} from "./modules.ts";

// % -> Flip Flop
// & -> Inverter

const example = `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

const example2 = `
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`;

async function main() {
  // const file = await Deno.readTextFile("input.txt");

  // const parsed = parseFile(file);
  const parsed = parseFile(example);

  const { circuit, counter } = buildCircuit(parsed);

  printCircuit(circuit);

  for (let i = 0; i < 1; i++) {
    circuit.broadcast.acceptPulse(0);
    circuit.broadcast.send();

    let lastSum = -1; // anything else than 0
    while (lastSum !== counter.getCounts()) {
      lastSum = counter.getCounts();

      // console.log(">> last", lastSum);
      printCircuit(circuit);

      for (const moduleName of Object.keys(circuit)) {
        if (moduleName === "broadcast") continue;
        // console.log("updating", moduleName, !!circuit[moduleName]);
        circuit[moduleName].send();
      }
    }
  }

  printCircuit(circuit);
  console.log(counter.getPrintableFinalCounts());
}

main();

//
// Solution
//

type TCircuit = Record<string, MachineModule>;

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
  const counter = new Counter();

  const circuit: TCircuit = {};

  for (const instr of instructions) {
    switch (instr.from.type) {
      case "broadcaster":
        circuit[instr.from.name] = new Broadcaster(
          instr.from.name,
          instr.to,
          counter.emit(instr.from.name).bind(counter),
          circuit
        );
        break;
      case "%":
        circuit[instr.from.name] = new FlipFlop(
          instr.from.name,
          instr.to,
          counter.emit(instr.from.name).bind(counter),
          circuit
        );
        break;
      case "&": {
        const inputs: Record<string, 0> = {};
        const name = instr.from.name;
        for (const instr of instructions) {
          if (instr.to.includes(name)) {
            inputs[instr.from.name] = 0;
          }
        }

        circuit[instr.from.name] = new Conjunction(
          instr.from.name,
          instr.to,
          counter.emit(instr.from.name).bind(counter),
          circuit,
          inputs
        );
        break;
      }
    }
  }

  // add outputs not in circuit
  const missingOutputs = instructions
    .flatMap((i) => i.to)
    .filter((name) => !circuit[name]);
  for (const missing of missingOutputs) {
    circuit[missing] = new Output(
      missing,
      [],
      counter.emit(missing).bind(counter),
      circuit
    );
  }

  return { circuit, counter };
}

function printCircuit(circuit: TCircuit) {
  const lines: string[] = [];

  for (const moduleName in circuit) {
    if (moduleName === "broadcast") continue;
    const m = circuit[moduleName];
    lines.push(`${m.name}:  state: ${JSON.stringify((m as any).state)}`);
  }

  console.log("-".repeat(10));
  console.log(lines.join("\n"));
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
