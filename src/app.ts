import dotenv from "dotenv";
import express from "express";
import cookieParse from "cookie-parser";
import { errorHandler } from "./infra/http/middlewares/errorHandler";
import loggerMiddleware from "./infra/http/middlewares/loggerMiddleware";
import authRoutes from "./infra/http/routes/AuthRoutes";
import userRoutes from "./infra/http/routes/UserRoutes";

dotenv.config({ path: ".env", override: true });

const app = express();

app.use(express.json());
app.use(cookieParse());
app.use(errorHandler);
app.use(loggerMiddleware);

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

export default app;
