import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
const wordDigits = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
const wordDigitsMap = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function mapWordToDigit(word: keyof typeof wordDigitsMap) {
  if (typeof wordDigitsMap[word] === "number") return wordDigitsMap[word];

  return Number(word);
}

function findFirst(line: string) {
  let first = "";
  let lowestIndex = Infinity;
  for (const word of wordDigits) {
    const index = line.indexOf(word);
    if (index > -1 && lowestIndex > index) {
      first = word;
      lowestIndex = index;
    }
  }

  return mapWordToDigit(first as keyof typeof wordDigitsMap);
}
function findLast(line: string) {
  let last = "";
  let highestIndex = -Infinity;
  for (const word of wordDigits) {
    const index = line.lastIndexOf(word);
    if (index > -1 && highestIndex < index) {
      last = word;
      highestIndex = index;
    }
  }

  return mapWordToDigit(last as keyof typeof wordDigitsMap);
}

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const lines = file.split("\n");

  const sum = lines.reduce((acc, line) => {
    const trimmedLine = line.trim();

    return acc + findFirst(trimmedLine) * 10 + findLast(trimmedLine);
  }, 0);

  console.log(sum);
}

main();

Deno.test("findFirst", () => {
  assertEquals(findFirst("twokfvsvfgdtmtwom2xlkjseven"), 2);
  assertEquals(findFirst("6twofive3two"), 6);
  assertEquals(findFirst("jcpcgznmmnine4ninenine"), 9);
});
Deno.test("findLast", () => {
  assertEquals(findLast("twokfvsvfgdtmtwom2xlkjseven"), 7);
  assertEquals(findLast("6twofive3two"), 2);
  assertEquals(findLast("jcpcgznmmnine4ninenine"), 9);
});
