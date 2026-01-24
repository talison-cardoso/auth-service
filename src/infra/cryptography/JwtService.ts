import { SignJWT, importPKCS8, jwtVerify, createRemoteJWKSet } from "jose";
import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import type { TokenVerifier } from "@/domain/cryptography/TokenVerifier";
import { AppError } from "@/domain/errors/AppError";
import { logger } from "@/utils/LoggerService";
import { JWT_ALGORITHM, JWT_KID } from "@/constants";

type TokenType = "access" | "refresh";

export class JwtService implements TokenGenerator, TokenVerifier {
  private readonly privateKeyPromise: Promise<CryptoKey>;
  private readonly jwks;

  constructor() {
    const envPrivateKey = process.env.JWT_PRIVATE_KEY;

    if (!envPrivateKey) {
      logger.error("JWT_PRIVATE_KEY não encontrado");
      throw new AppError("JWT_PRIVATE_KEY não encontrado", 500);
    }

    // prepara a private key uma vez
    this.privateKeyPromise = importPKCS8(envPrivateKey, JWT_ALGORITHM);

    // JWKS público (self)
    this.jwks = createRemoteJWKSet(
      new URL(
        process.env.JWT_JWKS_URL ??
          "http://localhost:3009/.well-known/jwks.json",
      ),
    );
  }

  async generate(
    payload: object,
    expiresIn: string | number,
    tokenType: TokenType,
  ): Promise<string> {
    if (tokenType !== "access") {
      logger.error(`Tentativa de gerar JWT para tipo ${tokenType}`);
      throw new AppError("JwtService só deve gerar Access Tokens", 500);
    }

    logger.debug("Gerando Access Token (JWT)");

    const privateKey = await this.privateKeyPromise;

    return new SignJWT(payload)
      .setProtectedHeader({
        alg: JWT_ALGORITHM,
        kid: JWT_KID,
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(privateKey);
  }

  async verify<T extends object>(
    token: string,
    tokenType: TokenType,
  ): Promise<T> {
    if (tokenType !== "access") {
      logger.error(`Tentativa de verificar JWT para tipo ${tokenType}`);
      throw new AppError("JwtService só deve verificar Access Tokens", 500);
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        algorithms: [JWT_ALGORITHM],
      });

      return payload as T;
    } catch (err) {
      logger.error("Erro ao verificar Access Token (JWT)");
      throw new AppError("Token inválido ou expirado", 401);
    }
  }
}
