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

import { createClient } from "@nillion/client-react-hooks";

import {
  NadaValue,
  UserId,
  ValuesPermissionsBuilder,
} from "@nillion/client-vms";

yargs(hideBin(process.argv))
  .scriptName("nilvm-nodejs-example")
  .usage("$0 <command> [options]")
  .command(
    "upload <path> [userid]",
    "Upload a file to nilVM, optionally give permissions to another party to read it",
    (yargs: Argv) => {
      return yargs.positional("path", {
        describe: "path to file",
        type: "string",
        demandOption: true,
      })
        .positional("userid", {
          describe: "User ID to share file with",
          type: "string",
        });
    },
    (argv: { path: string; userid?: string }) => {
      const init = async () => {
        console.log(chalk.yellow(`devnet: ${process.env.NILLION_CLUSTER_ID}`));
        const fileBuffer = await fsPromises.readFile(argv.path); // Read file as a Buffer

        const client = await createClient({
          network: "devnet",
        });

        let permissions = ValuesPermissionsBuilder.default(client.id);
        if (argv.userid) {
          console.log(`Enable retrieve for user: ${argv.userid}`);
          const other = new UserId(Buffer.from(argv.userid, "hex"));
          permissions = ValuesPermissionsBuilder.init().owner(client.id)
            .grantRetrieve(other).build();
        }

        const id = await client
          .storeValues()
          .ttl(1)
          .value(
            "myname",
            NadaValue.new_secret_blob(Uint8Array.from(fileBuffer)),
          )
          .permissions(permissions)
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
