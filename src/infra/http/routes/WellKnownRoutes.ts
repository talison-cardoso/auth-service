import { Router } from "express";
import { JwksController } from "../controllers/JwksController";

export const router = Router();

router.get("/jwks.json", JwksController.handle);
