export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  runId?: string;
  entity?: string;
  stage?: string;
  page?: number;
  url?: string;
  maxPages?: number;
}

export interface Logger {
  log(level: LogLevel, message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}
