#!/bin/bash -e

pnpm tsc

FILE_TO_UPLOAD=${1:-$(realpath ./package.json)}

# define a user key that the secret is shared with
export OTHER_SEED=another-nillion-userkey
NIL_IDENT_ID=$(openssl rand -hex 8)
nillion identity-gen --seed "$OTHER_SEED" "$NIL_IDENT_ID" >/dev/null
NIL_USER_ID=$(nillion identities show "$NIL_IDENT_ID" --output-format json | jq -r '.user_id')

TMP_STORE_ID_OUT=$(mktemp)
TMP_REVEAL_OUT=$(mktemp)

node --no-warnings --experimental-wasm-modules dist/index.js upload "$FILE_TO_UPLOAD" "$NIL_USER_ID" 2>"$TMP_STORE_ID_OUT"


TMP_STORE_ID=$(jq -r '.id' "$TMP_STORE_ID_OUT")
echo "stored [$TMP_STORE_ID] for user [$NIL_IDENT_ID]"

node --no-warnings --experimental-wasm-modules dist/index.js download "$TMP_STORE_ID" "$TMP_REVEAL_OUT"
cat "$TMP_REVEAL_OUT"

nillion identities remove "$NIL_IDENT_ID" >/dev/null
rm "$TMP_STORE_ID_OUT" "$TMP_REVEAL_OUT"
