import type { Request, Response } from "express";
import { z } from "zod";

import type { CreateUser } from "@/application/usecases/CreateUserUseCase";
import { BaseController } from "../BaseController";
import { getErrorMessage } from "@/utils/getErrorMessage";

const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export class CreateUserController extends BaseController {
  constructor(private readonly createUserserUseCase: CreateUser) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.body;
      const userValidation = userSchema.safeParse(user);

      if (!userValidation.success)
        return res.status(400).json({ message: userValidation.error.message });

      const createdUser = await this.createUserserUseCase.execute({
        username: user.username,
        password: user.password,
      });

      return res
        .status(200)
        .json({ user: { ...createdUser, password: undefined } });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (error instanceof Error && message === "Username already exists")
        return res.status(404).json({ error: error.message });

      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
