import * as io from "https://deno.land/std@0.167.0/io/mod.ts";
import { Reader } from "https://deno.land/std@0.167.0/io/types.d.ts";
import * as path from "https://deno.land/std@0.185.0/path/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

await new Command()
  .name("deno-head")
  .description("`head` command written by deno")
  .version("0.0.1")
  .option(
    "-n, --lines <num:number>",
    "Print the first num lines instead of the first 10."
  )
  .arguments("[file:string]")
  .action(async ({ lines }, file) => {
    let reader: Reader;

    if (Deno.isatty(Deno.stdin.rid)) {
      if (!file) {
        console.log("file is required if use stdin");
        Deno.exit(1);
      }

      try {
        reader = await Deno.open(
          path.isAbsolute(file) ? file : path.join(Deno.cwd(), file)
        );
      } catch {
        console.log(`failed to read file: ${file}`);
        Deno.exit(1);
      }
    } else {
      reader = Deno.stdin;
    }

    const maxLines = lines ?? 10;
    let curLines = 0;

    for await (const line of io.readLines(reader)) {
      if (curLines >= maxLines) {
        break;
      }

      console.log(line);
      curLines++;
    }
  })
  .parse(Deno.args);
