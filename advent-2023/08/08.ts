import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example2 = `
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)
`;
const example = `
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)
`;
const example3 = `
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const { instructions, nodes } = parseFile(file);

  const nodeMap = buildTree(nodes);

  let currentNode = "AAA";
  let i = 0;
  while (currentNode != "ZZZ") {
    const currentInstruction = instructions[i % instructions.length];

    currentNode = nodeMap[currentNode][currentInstruction === "R" ? 1 : 0];
    i++;

    if (i > 1000000) throw new Error("Too many iterations");
  }

  console.log(i);
}
async function main2() {
  const file = await Deno.readTextFile("input.txt");

  const { instructions, nodes } = parseFile(file);

  const nodeMap = buildTree(nodes);

  let currentNodes = findStartNodes(nodes).slice(0, 1);
  let i = 0;
  while (!checkEndNodes(currentNodes)) {
    console.log(i, currentNodes);
    const currentInstruction = instructions[i % instructions.length] as
      | "L"
      | "R";

    currentNodes = newCurrentNodes(nodeMap, currentNodes, currentInstruction);
    i++;

    if (i % 1_000_000 === 0) console.log(i);
    if (i > 1_000_000_000) throw new Error("Too many iterations");
  }

  console.log(i, currentNodes);
}
async function mainCycles() {
  const file = await Deno.readTextFile("input.txt");

  const { instructions, nodes } = parseFile(file);

  const nodeMap = buildTree(nodes);

  const currentNodes = findStartNodes(nodes);

  const firstZ = [] as number[];
  for (const currentNode of currentNodes) {
    const { seen, pos } = findCycle(currentNode, nodeMap, instructions);
    firstZ.push(pos[0]);
    console.log(currentNode, seen.length, pos);
    // Deno.writeFileSync(
    //   `${currentNode}.txt`,
    //   new TextEncoder().encode(seen.join("\n"))
    // );
  }

  console.log(firstZ.map((n) => n / 2));
  const product = firstZ
    .map((n) => n / 2)
    .reduce((a, b) => BigInt(a) * BigInt(b), BigInt(1));

  console.log(product);
}

function leastCommonMultiple(arr: number[]) {}

function findCycle(
  currentNode: string,
  nodeMap: Record<string, [string, string]>,
  instructions: "R" | "L"[]
) {
  let i = 0;
  const seen = [] as string[];
  const target = currentNode;
  let currentNodes = [currentNode];
  const pos: number[] = [];

  while (!checkEndNodes(currentNodes)) {
    const currentInstruction = instructions[i % instructions.length] as
      | "L"
      | "R";
    const [newCurrentNode] = newCurrentNodes(
      nodeMap,
      currentNodes,
      currentInstruction
    );
    currentNodes = [newCurrentNode];
    seen.push(newCurrentNode);
    if (newCurrentNode.endsWith("Z")) {
      pos.push(i);
    }
    if (currentInstruction !== instructions[0] && newCurrentNode === target) {
      console.log("Found cycle", i, currentNodes[0], currentInstruction);
      break;
    }
    i++;

    // if (i % 300 === 0) break;
    if (i % 1_000_000 === 0) console.log(i);
    if (i > 1_000_000_000) throw new Error("Too many iterations");
  }

  return { seen, pos };
}
mainCycles();
// main2();

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  const instructions = lines[0].trim().split("") as "R" | "L"[];

  const nodes = lines.slice(2).map(parseLine);

  return { instructions, nodes };
}

function findStartNodes(nodes: string[][]) {
  return nodes.filter((node) => node[0].endsWith("A")).map((node) => node[0]);
}
function checkEndNodes(nodeNames: string[]) {
  return nodeNames.every((node) => node.endsWith("Z"));
}

function newCurrentNodes(
  nodeMap: Record<string, [string, string]>,
  currentNodes: string[],
  instruction: "L" | "R"
) {
  const newNodes = new Set<string>();

  for (const node of currentNodes) {
    newNodes.add(nodeMap[node][instruction === "R" ? 1 : 0]);
  }

  return [...newNodes];
}

const reLine = /(\w{1,3}).*?(\w{1,3}).*?(\w{1,3})/;
// AAA = (BBB, CCC)
function parseLine(line: string) {
  const match = line.match(reLine);

  if (!match) {
    throw new Error(`Could not parse line: ${line}`);
  }

  return match.slice(1);
}

function buildTree(nodes: string[][]) {
  const nodeMap: Record<string, [string, string]> = {};

  for (const node of nodes) {
    nodeMap[node[0]] = [node[1], node[2]];
  }

  return nodeMap;
}

//
// Tests
//
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("simpl", () => {
  assertArrayIncludes(parseLine("AAA = (BBB, CCC)"), ["AAA", "BBB", "CCC"]);
  assertArrayIncludes(parseLine("CCS = (RMM, CLB)"), ["CCS", "RMM", "CLB"]);
});
