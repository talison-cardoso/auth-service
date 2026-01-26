import { Router } from "express";

import { LoginUseCase } from "@/application/usecases/LoginUseCase";
import { RefreshTokenUseCase } from "@/application/usecases/RefreshTokenUseCase";
import { LogoutUseCase } from "@/application/usecases/LogoutUseCase";

import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { LogoutController } from "../controllers/LogoutController";

import {
  userRepository,
  refreshTokenRepository,
  hasher,
  tokenService,
} from "@/infra/container";

const router = Router();

/* UseCases */
const loginUseCase = new LoginUseCase(
  userRepository,
  hasher,
  tokenService,
  refreshTokenRepository,
);

const refreshTokenUseCase = new RefreshTokenUseCase(
  refreshTokenRepository,
  tokenService,
);

const logoutUseCase = new LogoutUseCase(refreshTokenRepository);

/* Controllers */
const loginController = new LoginController(loginUseCase);
const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);
const logoutController = new LogoutController(logoutUseCase);

/* Routes */
router.post("/login", loginController.getHandler());
router.post("/refresh", refreshTokenController.getHandler());
router.post("/logout", logoutController.getHandler());

export default router;
