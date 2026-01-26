export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) return null;

    return new RefreshToken(record);
  }

  async revokeByToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.refreshToken.create({ data });
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; username: string } | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
  }
}
