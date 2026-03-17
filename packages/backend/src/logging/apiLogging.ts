import type { LogContext, Logger, LogLevel } from "../core/logging.js";
import { isValidUrl } from "../utils.js";

export class APILogging implements Logger {
  private loggingEndoint;

  constructor(loggingEndoint: string) {
    if (!isValidUrl(loggingEndoint))
      throw Error("Invalid logging API endpoint.");

    this.loggingEndoint = loggingEndoint;
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    throw new Error("Method not implemented.");
  }
  debug(message: string, context?: LogContext): void {
    throw new Error("Method not implemented.");
  }
  info(message: string, context?: LogContext): void {
    throw new Error("Method not implemented.");
  }
  warn(message: string, context?: LogContext): void {
    throw new Error("Method not implemented.");
  }
  error(message: string, context?: LogContext): void {
    throw new Error("Method not implemented.");
  }
}
