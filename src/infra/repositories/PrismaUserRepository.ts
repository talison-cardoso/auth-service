import type { CreateUserDTO } from "@/domain/dtos/CreateUserDTO";
import type { User } from "@/domain/entities/User";
import { AppError } from "@/domain/errors/AppError";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { prisma } from "../prisma/client";

export class PrismaUserRepository implements UserRepository {
  async create(user: CreateUserDTO): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          username: user.username,
          passwordHash: user.password,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(`Erro ao criar usuário: ${message}`, 500, error);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { username } });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(
        `Erro ao buscar usuário por username: ${message}`,
        500,
        error,
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { id } });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(
        `Erro ao buscar usuário por ID: ${message}`,
        500,
        error,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await prisma.user.findMany();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(
        `Erro ao buscar todos os usuários: ${message}`,
        500,
        error,
      );
    }
  }

  async update(id: string, user: User): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash,
        },
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(`Erro ao atualizar usuário: ${message}`, 500, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new AppError(`Erro ao deletar usuário: ${message}`, 500, error);
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
