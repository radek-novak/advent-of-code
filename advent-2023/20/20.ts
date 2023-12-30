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

async function main(tries: number = 1) {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example2);

  const { circuit, counter } = buildCircuit(parsed);

  const circuitEntries = Object.entries(circuit);

  circuitEntries.sort((a, b) => {
    if (a[0] === "broadcast") return -1;
    if (b[0] === "broadcast") return 1;
    if (a[1] instanceof FlipFlop && b[1] instanceof Conjunction) return -1;
    if (a[1] instanceof Conjunction && b[1] instanceof FlipFlop) return 1;
    if (a[1] instanceof FlipFlop && b[1] instanceof Output) return -1;
    if (a[1] instanceof Output && b[1] instanceof FlipFlop) return 1;
    if (a[1] instanceof Conjunction && b[1] instanceof Output) return -1;
    if (a[1] instanceof Output && b[1] instanceof Conjunction) return 1;

    if (a[1] instanceof Conjunction && b[1] instanceof Conjunction) {
      const byInput =
        Object.keys(a[1].state).length - Object.keys(b[1].state).length;

      if (byInput === 0) {
        return a[1].outputs.length - b[1].outputs.length;
      }

      return byInput;
    }
    if (a[1] instanceof FlipFlop && b[1] instanceof FlipFlop) {
      return a[1].outputs.length - b[1].outputs.length;
    }

    return 0;
  });
  // console.log(circuitEntries.map((ce) => ce[0]).join(", "));
  // printCircuit(circuit);

  for (let i = 0; i < tries; i++) {
    // printCircuit(circuit);
    counter.emit("button")("broadcast", 0);
    circuit.broadcast.acceptPulse(0, "button");
    circuit.broadcast.send();

    let lastSum = -1; // anything else than 0
    while (lastSum !== counter.getCounts()) {
      lastSum = counter.getCounts();

      // console.log(">> last", lastSum);
      // printCircuit(circuit);

      for (const moduleName of circuitEntries.map((ce) => ce[0])) {
        if (moduleName === "broadcast") continue;
        // console.log("updating", moduleName, !!circuit[moduleName]);
        circuit[moduleName].send();
      }
    }

    // console.log("---");
  }

  // console.log("--- final states (" + tries + ") ---");
  // printCircuit(circuit);
  console.log(
    tries.toString().padStart(4),
    ">>",
    counter.getPrintableFinalCounts()
  );
  // low 585923190
}

// main();
// main(2);
// main(3);
// main(4);
// main(5);
// main(6);
// main(7);
// main(8);
// main(9);
// main(10);
// main(100);
main(1000);

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
    lines.push(
      `${m.name}:  state: ${JSON.stringify(
        (m as any).state
      )} next: ${JSON.stringify((m as any).nextState)}`
    );
  }

  console.log("-".repeat(10));
  console.log(lines.join("\n"));
  console.log("-".repeat(10));
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
