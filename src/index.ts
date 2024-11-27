#!/usr/bin/env node

import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/*
import { createSignerFromKey } from "#/payment";
import type { ProgramId, Uuid } from "#/types";
import { type ValuesPermissions, ValuesPermissionsBuilder } from "#/types";
import { type VmClient, VmClientBuilder } from "#/vm";

import { NadaValue } from "@nillion/client-wasm";
import { NamedNetwork } from "@nillion/client-core";
import { createSignerFromKey } from "@nillion/client-payments";
import { NillionClient } from "@nillion/client-vms";
*/
import { createClient } from "@nillion/client-react-hooks";

// Define the CLI commands
yargs(hideBin(process.argv))
  .command(
    "post <userkey>",
    "post a secret to nillion",
    (yargs) => {
      return yargs.positional("userkey", {
        describe: "userkey of the data custodian",
        type: "string",
      });
    },
    (argv) => {
      const init = async () => {
        const client = await createClient("devnet");
        console.log(chalk.green(`Hello, ${argv.name}!`));
      };
      void init();
    },
  )
  .demandCommand(1, "You need at least one command before moving on")
  .help()
  .parse();
