import type { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/LoggerService";

const loggerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[ROUTE] requisição ${req.method} para ${req.originalUrl}`);

  next();
};

export default loggerMiddleware;
