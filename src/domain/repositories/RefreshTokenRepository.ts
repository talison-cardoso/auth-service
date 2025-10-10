import type { RefreshToken } from "../entities/RefreshToken";

export interface RefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;

  revokeByToken(token: string): Promise<void>;

  create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;

  findUserById(
    userId: string,
  ): Promise<{ id: string; username: string } | null>;
}
