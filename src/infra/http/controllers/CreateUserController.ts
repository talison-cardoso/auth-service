import type { Request, Response } from "express";
import { z } from "zod";

import type { CreateUser } from "@/application/usecases/CreateUserUseCase";
import { BaseController } from "../BaseController";
import { AppError } from "@/domain/errors/AppError";
import { formatZodErrors } from "@/utils/formatZodError";
import { logger } from "@/utils/LoggerService";
const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must have at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid username format"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(64)
    .refine(
      (pwd) => /[A-Z]/.test(pwd) && /[0-9]/.test(pwd),
      "Password must contain at least one uppercase letter and one digit",
    ),
});

export class CreateUserController extends BaseController {
  constructor(private readonly createUserUseCase: CreateUser) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.body;
      const userValidation = userSchema.safeParse(user);

      if (!userValidation.success)
        return res
          .status(400)
          .json({ message: formatZodErrors(userValidation.error) });

      const createdUser = await this.createUserUseCase.execute(
        userValidation.data,
      );

      if (createdUser instanceof Error) throw new AppError(createdUser.message);

      logger.info(`User created: ${createdUser.username}`);
      return res.status(201).json({
        user: { id: createdUser.id, username: createdUser.username },
      });
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({ error: error.message });

      logger.error("Unexpected error in CreateUserController:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
