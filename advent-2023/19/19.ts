import {
  assertArrayIncludes,
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}
`;

type Category = "x" | "m" | "a" | "s";
type Decision = "A" | "R";
type RuleSet = {
  key: string;
  rules: Rule[];
  default:
    | {
        ruleSet: string;
      }
    | {
        decision: Decision;
      };
};
type Rule = {
  comp: "<" | ">";
  category: Category;
  value: number;
  to:
    | {
        ruleSet: string;
      }
    | {
        decision: Decision;
      };
};
type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
};

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const { ruleSets, parts } = parseFile(file);
  // const { ruleSets, parts } = parseFile(example);

  // console.log(ruleSets, parts);

  const acceptedParts: Part[] = [];

  for (const part of parts) {
    if (evaluatePart(ruleSets, part)) {
      acceptedParts.push(part);
    }
  }

  const acceptedPartsSum = acceptedParts.reduce(
    (acc, part) => acc + partValue(part),
    0
  );

  console.log("Part I.:", acceptedPartsSum);
}

function parseFile(input: string) {
  const rePart = /^{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}$/;
  const reRuleSet = /^([a-z]+){(.*)}$/;
  const lines = input.trim().split("\n");

  const ruleSets = new Map<string, RuleSet>();
  const parts: Part[] = [];

  let parsingParts = false;
  for (const line of lines) {
    if (parsingParts) {
      const match = line.match(rePart);

      if (!match) {
        throw new Error(`Bad part line: ${line}`);
      }

      const [_, x, m, a, s] = match;

      parts.push({
        x: Number(x),
        m: Number(m),
        a: Number(a),
        s: Number(s),
      });

      continue;
    }

    if (line === "") {
      parsingParts = true;
      continue;
    }

    const lineMatch = line.match(reRuleSet);

    if (!lineMatch) {
      throw new Error(`Bad rule line: ${line}`);
    }

    const [_, key, rules] = lineMatch;

    const rule = parseRules(key, rules);
    ruleSets.set(key, rule);
  }

  return { ruleSets, parts };
}

// m<2257:cxq,s<2716:qrx,hls
// m>693:R,A
// s>664:A,s<307:R,R
function parseRules(key: string, rules: string) {
  const split = rules.split(",");
  const defaultCase = split.pop()!;

  return {
    key,
    rules: split.map((rule) => {
      const [condVal, to] = rule.split(":");

      const category = condVal[0] as Category;
      const comp = condVal[1] as "<" | ">";
      const value = Number(condVal.slice(2));

      if (comp !== "<" && comp !== ">") {
        throw new Error("Bad comp: " + rule);
      }

      if (
        category !== "x" &&
        category !== "m" &&
        category !== "a" &&
        category !== "s"
      ) {
        throw new Error("Bad category: " + rule);
      }

      return {
        category,
        comp,
        value,
        to:
          to === "A" || to === "R"
            ? { decision: to as Decision }
            : { ruleSet: to },
      };
    }),
    default:
      defaultCase === "A" || defaultCase === "R"
        ? { decision: defaultCase as Decision }
        : { ruleSet: defaultCase },
  };
}

function evaluatePart(
  ruleSet: Map<string, RuleSet>,
  part: Part,
  startLabel = "in"
) {
  const start = ruleSet.get(startLabel);

  if (!start) {
    throw new Error("No start label: " + startLabel);
  }

  let result = start.default;
  for (const rule of start.rules) {
    if (evaluateRule(rule, part)) {
      result = rule.to;
      break;
    }
  }

  if ("decision" in result) {
    return result.decision === "A";
  }

  return evaluatePart(ruleSet, part, result.ruleSet);
}

function evaluateRule(rule: Rule, part: Part) {
  const { category, comp, value } = rule;

  const partVal = part[category];

  if (comp === "<") {
    return partVal < value;
  } else {
    return partVal > value;
  }
}

function partValue(part: Part) {
  return part.x + part.m + part.a + part.s;
}

main();

//
// Tests
//
Deno.test("parseRules", () => {
  assertObjectMatch(parseRules("abc", "m<2257:cxq,s<2716:qrx,hls"), {
    key: "abc",
    rules: [
      {
        comp: "<",
        category: "m",
        value: 2257,
        to: {
          ruleSet: "cxq",
        },
      },
      {
        comp: "<",
        category: "s",
        value: 2716,
        to: {
          ruleSet: "qrx",
        },
      },
    ],
    default: {
      ruleSet: "hls",
    },
  });
});
Deno.test("parseRules 2", () => {
  assertObjectMatch(parseRules("ab", "s>664:A,s<307:R,R"), {
    key: "ab",
    rules: [
      {
        comp: ">",
        category: "s",
        value: 664,
        to: {
          decision: "A",
        },
      },
      {
        comp: "<",
        category: "s",
        value: 307,
        to: {
          decision: "R",
        },
      },
    ],
    default: {
      decision: "R",
    },
  });
});
Deno.test("evaluateRule", () => {
  assertEquals(
    evaluateRule(
      { comp: "<", category: "m", value: 2257, to: { ruleSet: "cxq" } },
      { x: 1, m: 2256, a: 1, s: 1 }
    ),
    true
  );
  assertEquals(
    evaluateRule(
      { comp: "<", category: "s", value: 3, to: { ruleSet: "cxq" } },
      { x: 1, m: 2257, a: 1, s: 4 }
    ),
    false
  );
});
Deno.test("arr", () => {
  // assertArrayIncludes
});
