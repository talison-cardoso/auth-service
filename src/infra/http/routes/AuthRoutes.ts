import { Router } from "express";
import { LoginUseCase } from "@/application/usecases/LoginUseCase";
import { RefreshTokenUseCase } from "@/application/usecases/RefreshTokenUseCase";
import { BcryptHasher } from "@/infra/cryptography/BcryptHasher";
import { JwtService } from "@/infra/cryptography/JwtService";
import { PrismaUserRepository } from "@/infra/repositories/PrismaUserRepository";
import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";

const router = Router();

const userRepository = new PrismaUserRepository();
const bcryptHasher = new BcryptHasher();
const jwtService = new JwtService();

const loginUseCase = new LoginUseCase(userRepository, bcryptHasher, jwtService);
const refreshTokenUseCase = new RefreshTokenUseCase(
  userRepository,
  jwtService,
  jwtService,
);

const loginController = new LoginController(loginUseCase);
const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);

router.post("/login", loginController.getHandler());
router.post("/refresh-token", refreshTokenController.getHandler());

export default router;
