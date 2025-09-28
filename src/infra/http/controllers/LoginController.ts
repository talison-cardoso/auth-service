import type { Request, Response } from "express";
import type { LoginUseCase } from "@/application/usecases/LoginUseCase";
import { BaseController } from "../BaseController";
import { logger } from "@/utils/LoggerService";
import { AppError } from "@/domain/errors/AppError";

export class LoginController extends BaseController {
  constructor(private readonly loginUseCase: LoginUseCase) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body;

    try {
      if (!username || !password)
        return res.status(400).json({ message: "Usuário ou senha inválidos" });

      const token = await this.loginUseCase.execute(username, password);

      logger.info(`Usuário autenticado`);
      return res.status(200).json({ token });
    } catch (error: unknown) {
      logger.error(``);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({ error: error.message });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
