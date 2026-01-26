import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_MS,
} from "@/constants";
import type { Hasher } from "@/domain/cryptography/Hasher";
import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import { AppError } from "@/domain/errors/AppError";
import type { RefreshTokenRepository } from "@/domain/repositories/RefreshTokenRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import { logger } from "@/utils/LoggerService";
import crypto from "node:crypto";

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
    private tokenGenerator: TokenGenerator,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    logger.debug(`Tentativa de login para usuário: ${username}`);

    const user = await this.userRepository.findByUsername(username);

    if (!user || !(await this.hasher.compare(password, user.passwordHash))) {
      logger.warn(
        `Falha de login para o usuário: ${username}. Credenciais inválidas.`,
      );
      throw new AppError("Credenciais inválidas", 401);
    }

    // Geração do Access Token (JWT) - Mantendo username e type
    const accessToken = await this.tokenGenerator.generate(
      { sub: user.id, username: user.username, type: "access" },
      ACCESS_TOKEN_EXPIRES_IN,
      "access",
    );

    // Geração e Armazenamento do Refresh Token (Token Opaco)
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const expiresInMs = REFRESH_TOKEN_EXPIRES_IN_MS;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: expiresAt,
    });

    logger.info(`Login bem-sucedido para ${user.username}. Tokens emitidos.`);
    return { accessToken, refreshToken };
  }
}
