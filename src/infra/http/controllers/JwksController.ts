import type { Request, Response } from "express";
import { JWT_KID, JWT_ALGORITHM } from "@/constants";

export class JwksController {
  static handle(_req: Request, res: Response) {
    res.json({
      keys: [
        {
          kty: "RSA",
          use: "sig",
          alg: JWT_ALGORITHM,
          kid: JWT_KID,
          n: process.env.JWT_JWKS_N!,
          e: process.env.JWT_JWKS_E!,
        },
      ],
    });
  }
}
