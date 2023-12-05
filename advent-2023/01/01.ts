const reDigit = /\d/;
function lineSum(line: string) {
  if (line.length === 0) return 0;
  const chars = line.split("");
  const first = chars.find((c) => reDigit.test(c));
  const last = chars.findLast((c) => reDigit.test(c));

  return Number(first) * 10 + Number(last);
}

const file = await Deno.readTextFile("input.txt");

const lines = file.split("\n");

const sum = lines.reduce((acc, line) => acc + lineSum(line), 0);

console.log(sum);
