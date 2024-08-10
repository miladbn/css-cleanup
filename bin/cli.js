#!/usr/bin/env node
import { program } from "commander";
import { scan } from "../src/scanner.js";
import { report } from "../src/reporter.js";
// import { remove } from "../src/remover.js";
program
  .command("scan <path>")
  .description("Scan project for unused CSS")
  .action(scan);

program
  .command("report")
  .description("Generate a report of unused CSS")
  .action(report);

// program.command("remove").description("Remove unused CSS").action(remove);

program.parse(process.argv);
