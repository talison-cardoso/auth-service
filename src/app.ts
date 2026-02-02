import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorHandler } from "@/infra/http/middlewares/errorHandler";
import loggerMiddleware from "@/infra/http/middlewares/loggerMiddleware";

import authRoutes from "@/infra/http/routes/AuthRoutes";
import userRoutes from "@/infra/http/routes/UserRoutes";
import { wellKnownRoutes } from "@/infra/http/routes/WellKnownRoutes";

dotenv.config({ override: true });

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const allowed = ["http://localhost:4321", "https://frontend.vercel.app"];

      return allowed.includes(origin)
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/.well-known", wellKnownRoutes);

// Error handler por último
app.use(errorHandler);

export default app;
