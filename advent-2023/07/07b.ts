import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

type Card = string;

type Hand = string;
type HandWithBet = {
  hand: Hand;
  bet: number;
};

enum HandRank {
  FiveOfAKind,
  FourOfAKind,
  FullHouse,
  ThreeOfAKind,
  TwoPair,
  Pair,
  HighCard,
}

const cardOrder = [
  "A",
  "K",
  "Q",

  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",

  "J",
];

const example = `
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483
`;

async function main() {
  const file = await Deno.readTextFile("input.txt");

  const parsed = parseFile(file);
  // const parsed = parseFile(example);

  parsed.sort((a, b) => compareHands(b.hand, a.hand));

  const totalHands = parsed.length;
  let sum = 0;
  for (let i = 0; i < totalHands; i++) {
    const hand = parsed[i];

    const multiplier = totalHands - i;

    console.log(hand.hand);
    sum += hand.bet * multiplier;
  }
  console.log(sum);
}
main();

function parseFile(file: string) {
  const lines = file.trim().split("\n");

  return lines.map(parseLine);
}

function parseLine(line: string): HandWithBet {
  const [cards, betString] = line.split(" ");

  return { hand: cards, bet: Number(betString) };
}

function compareCard(a: Card, b: Card) {
  if (a === b) return 0;
  else return cardOrder.indexOf(a) < cardOrder.indexOf(b) ? 1 : -1;
}

function compareHandsByHighCard(a: Hand, b: Hand): 1 | -1 | 0 {
  for (let i = 0; i < 5; i++) {
    const compare = compareCard(a[i], b[i]);
    if (compare !== 0) return compare;
  }
  return 0;
}
function getHandRank(a: Hand): HandRank {
  const cardCounts = {} as Record<Card, number>;
  let jokerCount = 0;
  // console.log(a);
  for (const card of a) {
    if (card === "J") jokerCount++;
    else if (cardCounts[card]) cardCounts[card] += 1;
    else cardCounts[card] = 1;
  }
  const counts = Object.values(cardCounts);
  counts.sort((a, b) => b - a);

  counts[0] ??= 0;
  counts[0] += jokerCount;

  if (counts[0] === 5) return HandRank.FiveOfAKind;
  if (counts[0] === 4) return HandRank.FourOfAKind;
  if (counts[0] === 3 && counts[1] === 2) return HandRank.FullHouse;
  if (counts[0] === 3) return HandRank.ThreeOfAKind;
  if (counts[0] === 2 && counts[1] === 2) return HandRank.TwoPair;
  if (counts[0] === 2) return HandRank.Pair;
  return HandRank.HighCard;
}
function compareHandsByRank(a: Hand, b: Hand): 1 | -1 | 0 {
  const aRank = getHandRank(a);
  const bRank = getHandRank(b);

  if (aRank > bRank) return -1;
  if (aRank < bRank) return 1;
  return 0;
}

function compareHands(a: Hand, b: Hand): 1 | -1 | 0 {
  const compare = compareHandsByRank(a, b);
  if (compare !== 0) return compare;

  return compareHandsByHighCard(a, b);
}

//
// Tests
//
Deno.test("getHandRank", () => {
  assertEquals(getHandRank("32T3K"), HandRank.Pair, "32T3K");
  assertEquals(getHandRank("7JAAA"), HandRank.FourOfAKind, "7AAAA");
  assertEquals(getHandRank("765JK"), HandRank.Pair, "765KK");
  assertEquals(getHandRank("8JJ88"), HandRank.FiveOfAKind);
  assertEquals(getHandRank("62345"), HandRank.HighCard);
  assertEquals(getHandRank("6234J"), HandRank.Pair);
  assertEquals(getHandRank("626J5"), HandRank.ThreeOfAKind);
  assertEquals(getHandRank("3T3JT"), HandRank.FullHouse);
  assertEquals(getHandRank("3T3TT"), HandRank.FullHouse);
});
Deno.test("compareHandsByRank", () => {
  assertEquals(compareHandsByRank("32T3K", "765KK"), 0);
  assertEquals(compareHandsByRank("86543", "7AAAA"), -1);
  assertEquals(compareHandsByRank("88543", "88AAA"), -1);
  assertEquals(compareHandsByRank("88543", "884AA"), -1);
  assertEquals(compareHandsByRank("88544", "884AA"), 0);
});
Deno.test("compareHandsByHighCard", () => {
  assertEquals(compareHandsByHighCard("QQQQ2", "JKKK2"), 1);
  assertEquals(compareHandsByHighCard("32T3K", "765KK"), -1);
  assertEquals(compareHandsByHighCard("86543", "7AAAA"), 1);
  assertEquals(compareHandsByHighCard("88543", "88AAA"), -1);
  assertEquals(compareHandsByHighCard("88543", "88JAA"), 1);
  assertEquals(compareHandsByHighCard("J8543", "284AA"), -1);
});
Deno.test("compareHands", () => {
  assertEquals(compareHands("QQQQ2", "JKKK2"), 1);
  assertEquals(compareHands("32T3K", "765KK"), -1);
  assertEquals(compareHands("86543", "7AAAA"), -1);
  assertEquals(compareHands("88543", "88AAA"), -1);
  assertEquals(compareHands("88544", "884AA"), 1);
  assertEquals(compareHands("88543", "884AA"), -1);
});
