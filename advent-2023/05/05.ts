import {
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

type RangeMap = {
  sourceName: string;
  destinationName: string;

  ranges: {
    source: number;
    destination: number;
    range: number;
  }[];
};

type Maps = {
  seeds: number[];

  sequences: RangeMap[][];
};

const example = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4

`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const { seeds, maps } = parseInput(file);

  const seedLocations: number[] = [];

  for (const seed of seeds) {
    const seedLocation = sourceToDestination(maps, seed);
    seedLocations.push(seedLocation);
  }

  const lowestLocation = Math.min(...seedLocations);

  console.log(seedLocations, lowestLocation);
}

main();

const createRangeMap = (): RangeMap => ({
  sourceName: "",
  destinationName: "",
  ranges: [],
});
function parseInput(file: string) {
  const lines = file.trim().split("\n");

  const seedsMatch = lines[0].matchAll(/([\d]+[ ]*?)+/g);

  const seeds = Array.from(seedsMatch).map((sa) => Number(sa[0]));

  let current = createRangeMap();

  const maps = [] as RangeMap[];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    const headingMatch = line.match(/^[\w-]+? map:$/);

    if (headingMatch) {
      maps.push(current);
      // in case of heading, start a new range map
      current = createRangeMap();
      const [source, destination] = headingMatch[0]
        .replace(" map:", "")
        .split("-to-");
      current.sourceName = source;
      current.destinationName = destination;
      continue;
    }

    const dataMatch = Array.from(line.matchAll(/([\d]+[ ]*?)+/g));

    if (dataMatch.length) {
      const dataRow = dataMatch.map((sa) => Number(sa[0]));

      current.ranges.push({
        source: dataRow[1],
        destination: dataRow[0],
        range: dataRow[2],
      });
    }
  }
  maps.push(current);
  maps.shift();

  return {
    seeds,
    maps,
  };
}

function getDestination(target: number, rangeMap: RangeMap) {
  const range = rangeMap.ranges.find(
    (r) => target >= r.source && target < r.source + r.range
  );
  if (!range) return target;

  const diff = target - range.source;

  return range.destination + diff;
}

function sourceToDestination(maps: RangeMap[], source: number, current = 0) {
  // console.log(maps[current]);
  if (!maps[current]) return source;

  const newDestination = getDestination(source, maps[current]);
  // console.log(source, newDestination);
  return sourceToDestination(maps, newDestination, current + 1);
}

//
// Tests
//
Deno.test("getDestination", () => {
  const rangeMap = createRangeMap();

  rangeMap.ranges.push({
    source: 2,
    destination: 5,
    range: 2,
  });
  rangeMap.ranges.push({
    source: 12,
    destination: 3,
    range: 10,
  });

  assertEquals(getDestination(3, rangeMap), 6);
  assertEquals(getDestination(2, rangeMap), 5);
  assertEquals(getDestination(1, rangeMap), 1);
  assertEquals(getDestination(9, rangeMap), 9);

  assertEquals(getDestination(19, rangeMap), 10);
});

Deno.test("sourceToDestination", () => {
  const input = parseInput(example);

  assertEquals(sourceToDestination(input.maps, 79), 82);
});
