import type { LogContext, Logger, LogLevel } from "../core/logging.js";

export class ConsoleLogger implements Logger {
  log(level: LogLevel, message: string, context: LogContext = {}): void {
    const parts = [
      `[${level.toUpperCase()}]`,
      context.runId ? `[run:${context.runId}]` : "",
      context.entity ? `[entity:${context.entity}]` : "",
      context.stage ? `[stage:${context.stage}]` : "",
      context.page !== undefined ? `[page:${context.page}]` : "",
      context.url ? `[url:${context.url}]` : "",
      message,
    ].filter(Boolean);

    console.log(parts.join(" "));
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }
}