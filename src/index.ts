#!/usr/bin/env node --experimental-wasm-modules

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

import { Argv } from "yargs";
import { promises as fsPromises } from "fs";
import { config } from "dotenv";
import { homedir } from "os";
import { join } from "path";

// Construct the path to the .env file in the home directory
const envPath = join(homedir(), ".config/nillion/nillion-devnet.env");

// Load the .env file
config({ path: envPath });

// import type { VmClient } from "@nillion/client-vms";
import { NadaValue } from "@nillion/client-vms";
import { ValuesPermissionsBuilder } from "@nillion/client-vms/types/values-permissions";
import { createClient } from "@nillion/client-react-hooks";

// Define the CLI commands
yargs(hideBin(process.argv))
  .scriptName("verida-poster")
  .usage("$0 <command> [options]")
  .command(
    "post <path>",
    "post a secret to nillion",
    (yargs: Argv) => {
      return yargs.positional("path", {
        describe: "path to file",
        type: "string",
        demandOption: true,
      });
    },
    (argv: { path: string }) => {
      const init = async () => {
        console.log(chalk.yellow(`devnet: ${process.env.NILLION_CLUSTER_ID}`));
        const fileBuffer = await fsPromises.readFile(argv.path); // Read file as a Buffer

        const client = await createClient({
          network: "devnet",
        });
        const id = await client
          .storeValues()
          .ttl(1)
          .value(
            "myname",
            NadaValue.new_secret_blob(Uint8Array.from(fileBuffer)),
          )
          .permissions(ValuesPermissionsBuilder.grantCompute())
          .build()
          .invoke();
        console.log(chalk.green(JSON.stringify({ id }, null, 4)));
      };
      void init();
    },
  )
  .help()
  .alias("help", "h")
  .parse();
