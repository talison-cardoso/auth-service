import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/domain/errors/AppError";
import type { TokenVerifier } from "@/domain/cryptography/TokenVerifier";
import { logger } from "@/utils/LoggerService";

interface AccessTokenPayload {
  sub: string;
  username: string;
  type: "access";
}

export function ensureAuthenticated(tokenVerifier: TokenVerifier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Token não fornecido" });

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token)
      return res.status(401).json({ error: "Token inválido" });

    try {
      const decoded = await tokenVerifier.verify<AccessTokenPayload>(
        token,
        "access",
      );

      if (decoded.type !== "access")
        return res
          .status(401)
          .json({ error: "Tipo de token inválido para autenticação" });

      req.user = {
        id: decoded.sub,
        username: decoded.username,
      };

      logger.debug(`Usuário autenticado: ${decoded.username}`);
      return next();
    } catch (error: unknown) {
      logger.warn(
        `Falha na autenticação do token: ${
          error instanceof Error ? error.message : "Desconhecido"
        }`,
      );

      if (error instanceof AppError)
        return res.status(401).json({ error: error.message });

      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
