export class Logger {
  static debug(message?: unknown, ...optionalParams: unknown[]): void {
    console.debug.apply(null, [message, optionalParams]);
  }

  static info(message?: unknown, ...optionalParams: unknown[]): void {
    console.info.apply(null, [message, optionalParams]);
  }

  static warn(message?: unknown, ...optionalParams: unknown[]): void {
    console.warn.apply(null, [message, optionalParams]);
  }

  static error(message?: unknown, ...optionalParams: unknown[]): void {
    console.error.apply(null, [message, optionalParams]);
  }
}
