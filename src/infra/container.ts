import { PrismaUserRepository } from "@/infra/repositories/PrismaUserRepository";
import { PrismaRefreshTokenRepository } from "@/infra/repositories/PrismaRefreshTokenRepository";
import { BcryptHasher } from "@/infra/cryptography/BcryptHasher";
import { JwtService } from "@/infra/cryptography/JwtService";

export const userRepository = new PrismaUserRepository();
export const refreshTokenRepository = new PrismaRefreshTokenRepository();
export const hasher = new BcryptHasher();
export const tokenService = new JwtService();
