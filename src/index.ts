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
  createSignerFromKey,
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
      (async () => {
        console.log(chalk.yellow(`devnet: ${process.env.NILLION_CLUSTER_ID}`));
        console.log(chalk.yellow(`file to upload: ${argv.path}`));
        const fileBuffer = await fsPromises.readFile(argv.path); // Read file as a Buffer

        const writer = await createClient({
          network: "devnet",
        });

        let permissions = ValuesPermissionsBuilder.default(writer.id);
        if (argv.userid) {
          console.log(`Enable retrieve for user: ${argv.userid}`);
          const other = new UserId(Buffer.from(argv.userid, "hex"));
          permissions = ValuesPermissionsBuilder.init().owner(writer.id)
            .grantRetrieve(other).build();
        }

        const id = await writer
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
        await fsPromises.writeFile("/dev/stderr", JSON.stringify({ id }));
      })();
    },
  )
  .command(
    "download <storeid> [path]",
    "Download a file from nilVM, optionally give an output file path else STDOUT",
    (yargs: Argv) => {
      return yargs
        .positional("storeid", {
          describe: "Store ID of nilVM secret",
          type: "string",
          demandOption: true,
        })
        .positional("path", {
          describe: "path to file",
          type: "string",
          demandOption: true,
        });
    },
    (argv: { storeid: string; path: string }) => {
      (async () => {
        console.log(chalk.yellow(`devnet: ${process.env.NILLION_CLUSTER_ID}`));

        // use a different wallet (from nillion-devnet) for fun
        const signer = await createSignerFromKey(
          process.env.NILLION_NILCHAIN_PRIVATE_KEY_1 as string,
        );

        const reader = await createClient({
          network: "devnet",
          seed: process.env.OTHER_SEED,
          signer,
        });

        const data = await reader
          .retrieveValues()
          .id(argv.storeid)
          .build()
          .invoke();

        const result = data["myname"]!;
        const plaintext = new TextDecoder().decode(result.value);
        if (argv.path) {
          await fsPromises.writeFile(argv.path, plaintext);
        } else {
          console.log(chalk.green(plaintext));
        }
      })();
    },
  )
  .help()
  .alias("help", "h")
  .parse();
