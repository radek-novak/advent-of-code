import {
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const example = `
Time:      7  15   30
Distance:  9  40  200
`;

const input = `
Time:        44     82     69     81
Distance:   202   1076   1138   1458
`;

async function main() {
  // const file = await Deno.readTextFile("input.txt");
  // const lines = file.trim().split("\n");

  const parsedExample = [
    { availableTime: 7, recordDistance: 9 },
    { availableTime: 15, recordDistance: 40 },
    { availableTime: 30, recordDistance: 200 },
  ];

  const parsedInput = [
    { availableTime: 44, recordDistance: 202 },
    { availableTime: 82, recordDistance: 1076 },
    { availableTime: 69, recordDistance: 1138 },
    { availableTime: 81, recordDistance: 1458 },
  ];

  let possibleWays = [];

  for (const { availableTime, recordDistance } of parsedInput) {
    let ways = 0;
    for (let i = 1; i < availableTime; i++) {
      const time = availableTime - i;
      const speed = i;
      const distanceTraveled = time * speed;
      if (distanceTraveled > recordDistance) {
        ways++;
      }
    }

    possibleWays.push(ways);
    ways = 0;
  }

  console.log(possibleWays);

  console.log(possibleWays.reduce((a, b) => a * b, 1));
}

function mainB() {
  const availableTime = 44826981;
  const recordDistance = 202107611381458;

  let start = 0;
  let end = availableTime;

  for (let i = 1; i < availableTime; i++) {
    const time = availableTime - i;
    const speed = i;
    const distanceTraveled = time * speed;

    if (distanceTraveled > recordDistance) {
      start = i;
      break;
    }
  }

  console.log({ start });
  for (let i = availableTime - 1; i > start; i--) {
    const time = availableTime - i;
    const speed = i;
    const distanceTraveled = time * speed;

    if (distanceTraveled > recordDistance) {
      end = i;
      break;
    }
  }

  console.log(end - start + 1);
}

mainB();

//
// Tests
//
Deno.test("obj", () => {
  // assertObjectMatch(  );
});
Deno.test("simpl", () => {
  // assertEquals(  );
});
