import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "debug";

class LoggerService {
  constructor() {
    const isProd = process.env.NODE_ENV === "production";
    chalk.level = isProd ? 0 : 1;
  }

  private log(level: LogLevel, message: string, context?: unknown): void {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}]`;

    let coloredPrefix: string;

    switch (level) {
      case "info":
        coloredPrefix = chalk.blue(base);
        break;
      case "warn":
        coloredPrefix = chalk.yellow(base);
        break;
      case "error":
        coloredPrefix = chalk.red(base);
        break;
      case "debug":
        coloredPrefix = chalk.magenta(base);
        break;
      default:
        coloredPrefix = base;
    }

    const formatted = `${coloredPrefix} ${message}`;
    console.log(formatted);

    if (context !== undefined) {
      try {
        const contextStr =
          typeof context === "object"
            ? JSON.stringify(context, null, 2)
            : String(context);
        console.log(contextStr);
      } catch {
        console.log("[Logger] Falha ao serializar contexto.");
      }
    }
  }

  info(message: string): void {
    this.log("info", message);
  }

  warn(message: string): void {
    this.log("warn", message);
  }

  error(message: string, error?: unknown): void {
    this.log("error", message, error);
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }
}

export const logger = new LoggerService();
