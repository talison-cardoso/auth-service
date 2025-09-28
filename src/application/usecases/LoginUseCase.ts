import type { Hasher } from "@/domain/cryptography/Hasher";
import type { TokenGenerator } from "@/domain/cryptography/TokenGenerator";
import { AppError } from "@/domain/errors/AppError";
import type { UserRepository } from "@/domain/repositories/UserRepository";

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
    private tokenGenerator: TokenGenerator,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new AppError("Usuário não encontrado", 401);

    const passwordMatches = await this.hasher.compare(
      password,
      user.passwordHash,
    );
    if (!passwordMatches) throw new AppError("Credenciais inválidas", 401);

    const payload = { sub: user.id, username: user.username };

    const accessToken = await this.tokenGenerator.generate(
      { ...payload, type: "access" },
      "15m",
      "access",
    );

    const refreshToken = await this.tokenGenerator.generate(
      { ...payload, type: "refresh" },
      "7d",
      "refresh",
    );

    if (!user.id) throw new AppError("Credenciais inválidas", 401);
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
