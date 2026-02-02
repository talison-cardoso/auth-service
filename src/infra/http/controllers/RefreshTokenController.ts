import type { RefreshTokenUseCase } from "@/application/usecases/RefreshTokenUseCase";
import { AppError } from "@/domain/errors/AppError";
import type { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { logger } from "@/utils/LoggerService";
import { REFRESH_TOKEN_EXPIRES_IN_MS } from "@/constants";

export class RefreshTokenController extends BaseController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies?.refreshToken;

    try {
      if (!refreshToken)
        return res.status(400).json({ message: "Refresh token is missing" });

      const { accessToken, refreshToken: newRefreshToken } =
        await this.refreshTokenUseCase.execute(refreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
        path: "/refresh",
        sameSite: "strict",
        // sameSite: "none", // domain different
      });

      logger.info("Tokens atualizados e rotacionados com sucesso.");

      return res.status(200).json({ accessToken });
    } catch (error: unknown) {
      logger.error(
        `Erro ao tentar refresh token: ${error instanceof AppError ? error.message : "Internal Server Error"}`,
      );

      if (error instanceof AppError) {
        if (error.statusCode === 401) {
          res.clearCookie("refreshToken");
        }
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
