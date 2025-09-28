import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import type { TokenVerifier } from "@/domain/cryptography/TokenVerifier";
import { AppError } from "@/domain/errors/AppError";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import { logger } from "@/utils/LoggerService";

interface RefreshTokenPayload {
  sub: string;
  username: string;
  type: "refresh";
}

export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenGenerator: TokenGenerator,
    private tokenVerifier: TokenVerifier,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.tokenVerifier.verify<RefreshTokenPayload>(
      refreshToken,
      "refresh",
    );

    if (payload.type !== "refresh")
      throw new AppError("Token inválido para refresh", 401);

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    if (user.refreshToken !== refreshToken)
      throw new AppError("Refresh token não corresponde ao registrado", 401);

    const newAccessToken = await this.tokenGenerator.generate(
      { sub: user.id, username: user.username, type: "access" },
      "15m",
      "access",
    );

    const newRefreshToken = await this.tokenGenerator.generate(
      { sub: user.id, username: user.username, type: "refresh" },
      "7d",
      "refresh",
    );

    if (!user.id) throw new AppError("Usuário inválido", 500);

    await this.userRepository.updateRefreshToken(user.id, newRefreshToken);

    logger.info(`Refresh token atualizado com sucesso`);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
