#!/usr/bin/env node --experimental-wasm-modules

import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Argv } from "yargs";
import { promises as fsPromises } from "fs";
import { config } from "dotenv";
import { homedir } from "os";
import { join } from "path";

const envPath = join(homedir(), ".config/nillion/nillion-devnet.env");
config({ path: envPath });

//import { NadaValue } from "@nillion/client-vms";
import { createClient } from "@nillion/client-react-hooks";

// BROKEN! how do I import this member?
// import { ValuesPermissionsBuilder } from "@nillion/client-vms/types/values-permissions";
import { NadaValue, ValuesPermissionsBuilder } from "@nillion/client-vms";

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
          .permissions(ValuesPermissionsBuilder.default(client.id))
          // .grantCompute(client.id, "")
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
