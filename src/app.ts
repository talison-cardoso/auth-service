import dotenv from "dotenv";
import express from "express";
import cookieParse from "cookie-parser";
import { errorHandler } from "./infra/http/middlewares/errorHandler";
import loggerMiddleware from "./infra/http/middlewares/loggerMiddleware";
import authRoutes from "./infra/http/routes/AuthRoutes";
import userRoutes from "./infra/http/routes/UserRoutes";
import cors from "cors";
import { wellKnownRoutes } from "./routes/WellKnownRoutes";

dotenv.config({ path: ".env", override: true });

const app = express();

// Configurações de CORS
const corsOptions = {
  origin: [
    "http://localhost:4321",
    "http://localhost:8080",
    "https://localhost:3000",
    "https://localhost:8080",
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParse());
app.use(errorHandler);
app.use(loggerMiddleware);

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/.well-known", wellKnownRoutes);

export default app;
