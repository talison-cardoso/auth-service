import type { Request, Response } from "express";
import type { LoginUseCase } from "@/application/usecases/LoginUseCase";
import { BaseController } from "../BaseController";
import { logger } from "@/utils/LoggerService";
import { AppError } from "@/domain/errors/AppError";
import {
  REFRESH_TOKEN_EXPIRES_IN_DAYS,
  REFRESH_TOKEN_EXPIRES_IN_MS,
} from "@/constants";

export class LoginController extends BaseController {
  constructor(private readonly loginUseCase: LoginUseCase) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body;

    try {
      if (!username || !password)
        return res.status(400).json({ message: "Credenciais inválidas" });

      const { accessToken, refreshToken } = await this.loginUseCase.execute(
        username,
        password,
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
        path: "/token/refresh",
        sameSite: "strict",
      });

      logger.info(`Usuário autenticado com sucesso e tokens emitidos.`);

      // 2. Retornar apenas o Access Token no corpo
      return res.status(200).json({ accessToken });
    } catch (error: unknown) {
      // Ajustando o logger
      logger.error(
        `Erro ao tentar login: ${error instanceof AppError ? error.message : "Internal Server Error"}`,
      );

      if (error instanceof AppError)
        return res.status(error.statusCode).json({ error: error.message });

      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
