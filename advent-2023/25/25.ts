import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

//
// Solution
//
async function buildDotGraph(parsed: { from: string; to: string[] }[]) {
  const nodes = new Set<string>();
  const edges = new Set<string>();
  const lines = ["digraph {", ...edges, "}"];

  const graphfile = lines.join("\n");

  for (const node of parsed) {
    nodes.add(node.from);
    node.to.forEach((to) => {
      nodes.add(to);
      edges.add(`${node.from} -- ${to} [tooltip="${node.from} -- ${to}"];`);
    });
  }
  const nodeCount = nodes.size;
  const edgeCount = edges.size;
  console.log({ nodeCount, edgeCount });

  await Deno.writeTextFile(`graph-${Date.now()}.dot`, graphfile);
}
//
// Tests
//
Deno.test("simple", () => {
  // assertEquals(  );
});
Deno.test("object", () => {
  // assertObjectMatch(  );
});
Deno.test("array", () => {
  // assertArrayIncludes
});

const example = `
jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  const edgeMap = new Map<string, string[]>();
  for (const node of parsed) {
    edgeMap.set(node.from, node.to);

    for (const tonode of node.to) {
      const edges = edgeMap.get(tonode) ?? [];
      edges.push(node.from);
      edgeMap.set(tonode, edges);
    }
  }

  for (const [k, v] of edgeMap) {
    if (k === "sph") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "rkh")
      );
    }
    if (k === "rkh") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "sph")
      );
    }
    if (k === "nnl") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "kpc")
      );
    }
    if (k === "kpc") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "nnl")
      );
    }

    if (k === "hrs") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "mnf")
      );
    }
    if (k === "mnf") {
      edgeMap.set(
        k,
        v.filter((e) => e !== "hrs")
      );
    }
  }

  // console.log(edgeMap);
  // walk
  // const next = [
  //   "klb",
  //   "jqj",
  //   "hlj",
  //   "gpz",
  //   "pgk",
  //   "jgh",
  //   "vth",
  //   "fxx",
  //   "rbh",
  //   "pjg",
  //   "chq",
  // ];

  const next = ["ttg", "dpd", "ztg", "vzj"];
  // const next = ["kmt"];
  // const next = [parsed[0].from];
  const visited = new Set<string>();

  while (next.length > 0) {
    const node = next.pop()!;
    visited.add(node);
    const edges = edgeMap.get(node);
    if (edges) {
      next.push(...edges.filter((e) => !visited.has(e)));
    }
  }

  console.log(visited.size, edgeMap.size);
  // console.log(
  //   [...edgeMap.keys()]
  //     .filter((k) => !visited.has(k))
  //     .map((k) => [k, edgeMap.get(k)])
  //   // .filter((e) => e?.length === 0)
  // );

  // for (let i = 0; i <= nodeCount / 2; i++) {
  //   console.log(i, nodeCount - i, i * nodeCount - i);
  // }

  // const nodesToCut = ["sph-rkh", "nnl-kpc", "hrs-mnf"];
}

function parseFile(input: string) {
  const lines = input.trim().split("\n");

  return lines.map((line) => {
    const [from, to] = line.split(": ");
    const tos = to.split(" ");

    return { from, to: tos };
  });
}

main();
