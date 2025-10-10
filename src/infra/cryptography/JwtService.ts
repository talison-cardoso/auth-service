import jwt from "jsonwebtoken";
import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import type { TokenVerifier } from "@/domain/cryptography/TokenVerifier";
import { AppError } from "@/domain/errors/AppError";
import { logger } from "@/utils/LoggerService";

type TokenType = "access" | "refresh";

export class JwtService implements TokenGenerator, TokenVerifier {
  private readonly privateKey;
  private readonly publicKey;

  constructor() {
    const envPrivateKey = process.env.JWT_PRIVATE_KEY;
    const envPublicKey = process.env.JWT_PUBLIC_KEY;

    if (!envPrivateKey) {
      logger.error("JWT_PRIVATE_KEY não encontrado");
      throw new AppError("JWT_PRIVATE_KEY não encontrado", 500);
    }
    if (!envPublicKey) {
      logger.error("JWT_PUBLIC_KEY não encontrado");
      throw new AppError("JWT_PUBLIC_KEY não encontrado", 500);
    }

    this.privateKey = envPrivateKey;
    this.publicKey = envPublicKey;
  }

  async generate(
    payload: object,
    expiresIn: string | number,
    tokenType: TokenType,
  ): Promise<string> {
    if (tokenType !== "access") {
      logger.error(`Tentativa de gerar token JWT para tipo ${tokenType}`);
      throw new AppError("JwtService só deve gerar Access Tokens", 500);
    }
    logger.debug(`Gerando Access Token (JWT)`);

    // **CORREÇÃO:** Usando this.privateKey para assinar
    return jwt.sign(payload, this.privateKey, {
      expiresIn,
      algorithm: "RS256",
    } as jwt.SignOptions);
  }

  async verify<T extends object>(
    token: string,
    tokenType: TokenType,
  ): Promise<T> {
    if (tokenType !== "access") {
      logger.error(`Tentativa de verificar token JWT para tipo ${tokenType}`);
      throw new AppError("JwtService só deve verificar Access Tokens", 500);
    }
    try {
      return jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as T;
    } catch {
      logger.error("Erro ao verificar Access Token (JWT)");
      throw new AppError("Token inválido ou expirado", 401);
    }
  }
}
