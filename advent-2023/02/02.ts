import {
  assertObjectMatch,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const file = await Deno.readTextFile("input.txt");
const lines = file.split("\n");

type CubeColor = "red" | "blue" | "green";
type GameLine = `Game ${number}: ${string}`;

type GamePull = {
  red: number;
  blue: number;
  green: number;
};

type Game = {
  id: number;
  pulls: GamePull[];
};

const blankGame = (id: number): Game => ({
  id,
  pulls: [],
});

const reGame = /^Game (\d+)/;

// Game 24: 1 blue, 1 green; 1 blue; 1 red
function parseLine(line: GameLine) {
  const [gameIdString, gameString] = line.split(":");
  const gameIdMatch = reGame.exec(gameIdString);
  if (gameIdMatch === null) throw new Error("Invalid game line");

  const gameId = Number(gameIdMatch[1]);
  const game = blankGame(gameId);

  game.pulls = parseGameString(gameString);

  return game;
}

// 1 blue, 1 green; 1 blue; 1 red
function parseGameString(gameString: string): GamePull[] {
  const pullStrings = gameString.trim().split("; ");

  return pullStrings.map(parsePullString);
}

// 3 red, 5 green, 6 blue
function parsePullString(pullString: string): GamePull {
  const colorPullStrings = pullString.trim().split(", ");
  const pull = {
    red: 0,
    blue: 0,
    green: 0,
  };
  for (const colorPullString of colorPullStrings) {
    const { color, number } = parseColorPullString(colorPullString);
    pull[color] = number;
  }
  return pull;
}

function parseColorPullString(colorPullString: string): {
  color: CubeColor;
  number: number;
} {
  const [numberString, color] = colorPullString.split(" ");
  const number = Number(numberString);
  return { color: color as CubeColor, number };
}

function isPullValid(target: GamePull, pull: GamePull) {
  return (
    pull.blue <= target.blue &&
    pull.green <= target.green &&
    pull.red <= target.red
  );
}

function calculatePullPower(pull: GamePull) {
  return pull.blue * pull.green * pull.red;
}

function getMinimumPull(pulls: GamePull[]) {
  const minimumPull = {
    red: 0,
    blue: 0,
    green: 0,
  };

  for (const pull of pulls) {
    minimumPull.red = Math.max(minimumPull.red, pull.red);
    minimumPull.blue = Math.max(minimumPull.blue, pull.blue);
    minimumPull.green = Math.max(minimumPull.green, pull.green);
  }

  return minimumPull;
}

function isGameValid(target: GamePull, game: Game) {
  return game.pulls.every((pull) => isPullValid(target, pull));
}

function mainA() {
  const target = {
    red: 12,
    green: 13,
    blue: 14,
  };

  const result = lines.reduce((acc, line) => {
    const trimmedLine = line.trim();
    if (trimmedLine === "") return acc;

    const game = parseLine(trimmedLine as GameLine);

    const isValid = isGameValid(target, game);

    return isValid ? acc + game.id : acc;
  }, 0);

  console.log(result);
}

function mainB() {
  const result = lines.reduce((acc, line) => {
    const trimmedLine = line.trim();
    if (trimmedLine === "") return acc;
    const game = parseLine(trimmedLine as GameLine);

    const minimumPull = getMinimumPull(game.pulls);
    return acc + calculatePullPower(minimumPull);
  }, 0);

  console.log(result);
}

mainB();

//
// Tests
//
Deno.test("getMinimumPull", () => {
  assertObjectMatch(
    getMinimumPull([
      { blue: 1, green: 33, red: 1 },
      { blue: 0, green: 15, red: 1 },
      { blue: 0, green: 1, red: 2 },
    ]),
    { blue: 1, green: 33, red: 2 }
  );
});
Deno.test("validPull", () => {
  assertEquals(
    isPullValid({ blue: 1, green: 33, red: 1 }, { blue: 0, green: 15, red: 1 }),
    true
  );
  assertEquals(
    isPullValid({ blue: 1, green: 1, red: 2 }, { blue: 1, green: 1, red: 3 }),
    false
  );
});
Deno.test("parseLine", () => {
  const line = "Game 24: 1 blue, 1 green; 1 blue; 1 red";
  const target = {
    id: 24,
    pulls: [
      {
        blue: 1,
        green: 1,
        red: 0,
      },
      {
        blue: 1,
        green: 0,
        red: 0,
      },
      {
        blue: 0,
        green: 0,
        red: 1,
      },
    ],
  };

  assertObjectMatch(target, parseLine(line));
});
Deno.test("parseGameString", () => {
  const line =
    "13 blue, 3 green; 3 red, 5 green, 6 blue; 2 red, 11 green, 9 blue";
  const target = [
    {
      blue: 13,
      green: 3,
    },
    {
      red: 3,
      green: 5,
      blue: 6,
    },
    {
      red: 2,
      green: 11,
      blue: 9,
    },
  ];

  const pulls = parseGameString(line);

  assertObjectMatch(pulls[0], target[0]);
  assertObjectMatch(pulls[1], target[1]);
  assertObjectMatch(pulls[2], target[2]);
});
Deno.test("parsePullString", () => {
  const line = "13 blue, 3 green";
  const line2 = "3 red, 5 green, 6 blue";

  const target1 = {
    blue: 13,
    green: 3,
    red: 0,
  };

  const target2 = {
    red: 3,
    green: 5,
    blue: 6,
  };

  assertObjectMatch(target1, parsePullString(line));
  assertObjectMatch(target2, parsePullString(line2));
});

Deno.test("parsePull", () => {
  const color = "13 blue";
  const color2 = "3 green";

  assertObjectMatch({ color: "blue", number: 13 }, parseColorPullString(color));
  assertObjectMatch(
    { color: "green", number: 3 },
    parseColorPullString(color2)
  );
});
