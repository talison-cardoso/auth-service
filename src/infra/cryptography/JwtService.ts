import jwt from "jsonwebtoken";
import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import type { TokenVerifier } from "@/domain/cryptography/TokenVerifier";
import { AppError } from "@/domain/errors/AppError";
import { logger } from "@/utils/LoggerService";

type TokenType = "access" | "refresh";

export class JwtService implements TokenGenerator, TokenVerifier {
  private getSecret(tokenType: TokenType): string {
    if (tokenType === "access") {
      if (!process.env.JWT_PRIVATE_KEY)
        throw new AppError("JWT_ACCESS_SECRET não configurado", 500);
      return process.env.JWT_PRIVATE_KEY;
    }

    if (tokenType === "refresh") {
      if (!process.env.JWT_PRIVATE_KEY)
        throw new AppError("JWT_REFRESH_SECRET não configurado", 500);
      return process.env.JWT_PRIVATE_KEY;
    }

    throw new AppError("Tipo de token inválido", 500);
  }

  async generate(
    payload: object,
    expiresIn: string | number,
    tokenType: TokenType,
  ): Promise<string> {
    const secret = this.getSecret(tokenType);
    logger.debug(`Gerando token ${tokenType}`);
    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm: "RS256",
    } as jwt.SignOptions);
  }

  async verify<T extends object>(
    token: string,
    tokenType: TokenType,
  ): Promise<T> {
    const secret = this.getSecret(tokenType);
    try {
      return jwt.verify(token, secret, { algorithms: ["RS256"] }) as T;
    } catch {
      logger.error("Erro ao verificar token");
      throw new AppError("Token inválido ou expirado", 401);
    }
  }
}
