import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
} from "@/constants";
import { AppError } from "@/domain/errors/AppError";
import type { RefreshTokenRepository } from "@/domain/repositories/RefreshTokenRepository";
import { logger } from "@/utils/LoggerService";
import crypto from "node:crypto";

import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";

export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenGenerator: TokenGenerator,
  ) {}

  async execute(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    logger.debug("Iniciando processo de refresh token.");

    // 1. Buscar o Refresh Token no Banco de Dados
    const tokenRecord =
      await this.refreshTokenRepository.findByToken(oldRefreshToken);

    // 2. Validações de Segurança
    if (!tokenRecord) {
      logger.warn("Tentativa de refresh com token não encontrado/inválido.");
      throw new AppError("Token inválido", 401);
    }

    if (tokenRecord.revoked) {
      logger.warn(
        `Tentativa de uso de token revogado pelo userId: ${tokenRecord.userId}.`,
      );
      throw new AppError("Token revogado", 401);
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.revokeByToken(oldRefreshToken);
      logger.warn(
        `Token expirado revogado no banco para userId: ${tokenRecord.userId}.`,
      );
      throw new AppError("Token expirado", 401);
    }

    // 3. Buscar Dados do Usuário
    const user = await this.refreshTokenRepository.findUserById(
      tokenRecord.userId,
    );
    if (!user) {
      await this.refreshTokenRepository.revokeByToken(oldRefreshToken);
      logger.error(
        `Token órfão encontrado. Revogado. userId: ${tokenRecord.userId}.`,
      );
      throw new AppError("Usuário não encontrado", 404);
    }

    // 4. Rotação: Revogar o token antigo antes de emitir o novo
    await this.refreshTokenRepository.revokeByToken(oldRefreshToken);
    logger.debug(`Refresh Token antigo revogado para ${user.username}.`);

    // 5. Geração de Novos Tokens

    // Novo Access Token (JWT) - Incluindo 'type: "access"' para o ensureAuthenticated
    const newAccessToken = await this.tokenGenerator.generate(
      { sub: user.id, username: user.username, type: "access" },
      ACCESS_TOKEN_EXPIRES_IN,
      "access",
    );

    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    const expiresInMs = REFRESH_TOKEN_COOKIE_EXPIRATION_MS;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: expiresAt,
    });

    logger.info(
      `Refresh token atualizado e rotacionado com sucesso para ${user.username}.`,
    );
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
