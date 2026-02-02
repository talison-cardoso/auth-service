import { importSPKI, exportJWK } from "jose";
import fs from "fs";

const pem = fs.readFileSync("public_key.pem", "utf8");

const key = await importSPKI(pem, "RS256");
const jwk = await exportJWK(key);

console.log("JWT_JWKS_N=", jwk.n);
console.log("JWT_JWKS_E=", jwk.e);
