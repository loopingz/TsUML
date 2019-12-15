#! /usr/bin/env node

import chalk from "chalk";
import * as yargs from "yargs";
import { getDsl } from "../core";
import { Templates } from "../core/templates";

(async () => {
  try {
    if (yargs.argv.help) {
      console.log(chalk.yellowBright("tsuml --glob ./src/**/*.ts (--type mermaid|yuml) --output "));
    }

    const pattern = yargs.argv.glob;

    if (yargs.argv.type) {
      Templates.setType(yargs.argv.type);
    }

    if (!pattern) {
      console.log(chalk.redBright("Missing --glob"));
    } else {
      const dsl = await getDsl("./tsconfig.json", yargs.argv.glob);
      Templates.finalize(dsl, yargs.argv);
    }
  } catch (e) {
    console.log(chalk.redBright(e));
  }
})();
