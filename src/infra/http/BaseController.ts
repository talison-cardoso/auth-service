import type { NextFunction, Request, RequestHandler, Response } from "express";

export abstract class BaseController {
  abstract execute(req: Request, res: Response): Promise<Response>;

  getHandler(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.execute(req, res).catch(next);
    };
  }
}
