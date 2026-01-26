export class LogoutUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const token =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!token) return;

    await this.refreshTokenRepository.revokeAllByUserId(token.userId);
  }
}
