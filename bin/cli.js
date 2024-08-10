#!/usr/bin/env node
const { program } = require("commander");
const { scan } = require("../src/scanner");
const { report } = require("../src/reporter");
const { remove } = require("../src/remover");

program
  .command("scan <path>")
  .description("Scan project for unused CSS")
  .action(scan);

program
  .command("report")
  .description("Generate a report of unused CSS")
  .action(report);

program.command("remove").description("Remove unused CSS").action(remove);

program.parse(process.argv);
