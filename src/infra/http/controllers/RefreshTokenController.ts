import type { RefreshTokenUseCase } from "@/application/usecases/RefreshTokenUseCase";
import { AppError } from "@/domain/errors/AppError";
import type { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { logger } from "@/utils/LoggerService";

export class RefreshTokenController extends BaseController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies?.refreshToken;

    try {
      if (!refreshToken)
        return res.status(400).json({ message: "Refresh token is missing" });

      const tokens = await this.refreshTokenUseCase.execute(refreshToken);
      logger.info("Tokens atualizados");
      return res.status(200).json(tokens);
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({ error: error.message });

      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
