import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
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

type RangeMapNew = {
  sourceName: string;
  destinationName: string;

  ranges: {
    source: Range;
    destination: Range;
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
async function main2() {
  // const file = await Deno.readTextFile("input.txt");

  const { seeds, maps } = parseInput(example);
  const seedRanges = [] as Range[];
  const newRangeMap = [] as RangeMapNew[];

  for (let i = 0; i < seeds.length; i += 2) {
    const start = seeds[i];
    const range = seeds[i + 1];
    seedRanges.push([start, start + range - 1]);
  }

  for (const map of maps) {
    const newMap: RangeMapNew = {
      sourceName: map.sourceName,
      destinationName: map.destinationName,
      ranges: [],
    };

    for (const range of map.ranges) {
      const newRange = {
        source: [range.source, range.source + range.range - 1],
        destination: [range.destination, range.destination + range.range - 1],
      };
      newMap.ranges.push(newRange as any);
    }
    newRangeMap.push(newMap);
  }
  // console.log(newRangeMap);
  // console.log(seedRanges);

  // for (const seedRange of seedRanges) {
  //   const newSeedRange = seedRange;
  //   for (const map of newRangeMap) {
  //     for (const range of map.ranges) {
  //       const overlap = getRangeOverlaps(newSeedRange, range.source);

  //       if (overlap.overlap) {
  //         console.log(overlap);
  //         newSeedRange[0] = overlap.overlap[1] + 1;
  //       }
  //     }
  //   }
  //   console.log(newSeedRange);
  // }
}
// main();

const createRangeMap = (): RangeMap => ({
  sourceName: "",
  destinationName: "",
  ranges: [],
});
// main2();
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

// inclusive; first and last element of the range, [1,3] is length 3, [1,1] length 1
type Range = [number, number];
function getRangeOverlaps(source: Range, target: Range): Range | null {
  //             .....[....]....
  // left cross  ...[...].......
  // right cross ........[...]..
  // wrap around ...[........]..
  // inner       ......[..].....
  // no overlap  .[..]..........
  // no overlap  ...........[.].

  const [sourceStart, sourceEnd] = source;
  const [targetStart, targetEnd] = target;

  // no overlap
  if (sourceEnd < targetStart || sourceStart > targetEnd) {
    return null;
  }

  if (sourceStart < targetStart) {
    return [targetStart, Math.min(sourceEnd, targetEnd)];
  } else {
    // sourceStart >= targetStart
    return [sourceStart, Math.min(sourceEnd, targetEnd)];
  }
}

// function mapRanges(ranges: Range[], rangeMap: RangeMapNew) {
//   const newRanges = [] as Range[];
//   const oldRanges = [...ranges];

//   do {
//     const oldRange = oldRanges.shift();
//     if (!oldRange) break;

//     for (const range of rangeMap.ranges) {
//       const overlaps = getRangeOverlaps(oldRange, range.source);
//       if (overlaps.overlap) {
//         const diff = range.destination[0] - range.source[0];
//         newRanges.push(mapRange(overlaps.overlap, diff));
//       }

//       oldRanges.push(...overlaps.rest);
//     }
//   } while (oldRanges.length);

//   return newRanges;
// }

function mapRange([a, b]: Range, diff: number) {
  return [a + diff, b + diff] as Range;
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

Deno.test("getRangeOverlaps", () => {
  //             .....[....]....
  // left cross  ...[...].......
  // right cross ........[...]..
  // wrap around ...[........]..
  // inner       ......[..].....
  // no overlap  .[..]..........
  const target = [5, 11] as Range;

  assertArrayIncludes(getRangeOverlaps([11, 14], target)!, [11, 11]);
  assertArrayIncludes(getRangeOverlaps([11, 11], target)!, [11, 11]);
  assertArrayIncludes(getRangeOverlaps([5, 12], target)!, [5, 11]);
  assertArrayIncludes(getRangeOverlaps([6, 12], target)!, [6, 11]);
  assertArrayIncludes(getRangeOverlaps([6, 8], target)!, [6, 8]);
  assertEquals(getRangeOverlaps([2, 4], target)!, null);
  assertEquals(getRangeOverlaps([12, 14], target), null);
  assertArrayIncludes(getRangeOverlaps([3, 8], target)!, [5, 8]);
});
// Deno.test("mapRanges", () => {
//   const rangeMap: RangeMapNew = {
//     sourceName: "seed",
//     destinationName: "soil",
//     ranges: [
//       { source: [98, 99], destination: [50, 51] },
//       { source: [50, 97], destination: [52, 99] },
//     ],
//   };

//   const mapped = mapRanges([[79, 82]], rangeMap);
//   assertEquals(mapped, [[82, 85]]);
// });
