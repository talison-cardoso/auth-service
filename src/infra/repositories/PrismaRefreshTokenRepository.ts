import type { RefreshTokenRepository } from "@/domain/repositories/RefreshTokenRepository";
import { prisma } from "../prisma/client";
import { RefreshToken } from "@/domain/entities/RefreshToken";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
      select: {
        userId: true,
        token: true,
        expiresAt: true,
        revoked: true,
      },
    });
    if (!record) return null;

    return new RefreshToken({
      userId: record.userId,
      token: record.token,
      expiresAt: record.expiresAt,
      revoked: record.revoked,
    });
  }

  async revokeByToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; username: string } | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });
    return user;
  }
}
