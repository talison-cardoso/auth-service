import { Router } from "express";
import { LoginUseCase } from "@/application/usecases/LoginUseCase";
import { RefreshTokenUseCase } from "@/application/usecases/RefreshTokenUseCase";
import { BcryptHasher } from "@/infra/cryptography/BcryptHasher";
import { JwtService } from "@/infra/cryptography/JwtService";
import { PrismaUserRepository } from "@/infra/repositories/PrismaUserRepository";
import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { PrismaRefreshTokenRepository } from "@/infra/repositories/PrismaRefreshTokenRepository";

const router = Router();

const userRepository = new PrismaUserRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();
const bcryptHasher = new BcryptHasher();
const jwtService = new JwtService();

const loginUseCase = new LoginUseCase(
  userRepository,
  bcryptHasher,
  jwtService,
  refreshTokenRepository,
);
const refreshTokenUseCase = new RefreshTokenUseCase(
  refreshTokenRepository,
  jwtService,
);

const loginController = new LoginController(loginUseCase);
const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);

router.post("/login", loginController.getHandler());
router.post("/refresh", refreshTokenController.getHandler());
// router.post("/logout", loginController.logoutHandler());
// router.post("/jwks", loginController.jwksHandler()); // TODO: Implement -

export default router;
