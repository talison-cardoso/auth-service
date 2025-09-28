import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/domain/errors/AppError";
import { JwtService } from "@/infra/cryptography/JwtService";
import { logger } from "@/utils/LoggerService";

interface AccessTokenPayload {
  sub: string;
  username: string;
  type: "access";
}

export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Token não fornecido" });

  const [, token] = authHeader.split(" ");
  if (!token) return res.status(401).json({ error: "Token inválido" });

  try {
    const jwtService = new JwtService();
    const decoded = await jwtService.verify<AccessTokenPayload>(
      token,
      "access",
    );

    if (decoded.type !== "access")
      return res
        .status(401)
        .json({ error: "Tipo de token inválido para autenticação" });

    req.user = { id: decoded.sub, username: decoded.username };
    logger.debug(`Autenticado como ${req.user.username}`);
    return next();
  } catch (error: unknown) {
    if (error instanceof AppError)
      return res.status(401).json({ error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
