import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";
import { Reader } from "https://deno.land/std@0.167.0/io/types.d.ts";
import { isAbsolute, join } from "https://deno.land/std@0.185.0/path/mod.ts";
import { red } from "https://deno.land/std@0.186.0/fmt/colors.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

const fileToReader = async (file?: string) => {
  if (!file) {
    console.error(red("file is required"));
    Deno.exit(1);
  }

  const filename = isAbsolute(file) ? file : join(Deno.cwd(), file);
  return await Deno.open(filename).catch(() => {
    console.error(red(`failed to read file: '${file}'`));
    Deno.exit(1);
  });
};

const printLines = async (reader: Reader, maxLines: number) => {
  let curLines = 0;

  for await (const line of readLines(reader)) {
    if (curLines >= maxLines) {
      break;
    }

    console.log(line);
    curLines++;
  }
};

type Action = (options: { lines?: number }, file?: string) => void;

const action: Action = async ({ lines }, file) => {
  const isatty = Deno.isatty(Deno.stdin.rid);
  const reader = isatty ? await fileToReader(file) : Deno.stdin;
  const maxLines = lines ?? 10;
  printLines(reader, maxLines);
};

await new Command()
  .name("deno-head")
  .description("`head` command written by deno")
  .version("0.0.1")
  .option(
    "-n, --lines <num:number>",
    "Print the first <num> lines instead of the first 10."
  )
  .arguments("[file:string]")
  .action(action)
  .parse(Deno.args);
