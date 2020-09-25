export class Logger {
  private constructor() {}

  static debug(...args: any) {
    console.debug.apply(null, args);
  }

  static info(...args: any) {
    console.info.apply(null, args);
  }

  static warn(...args: any) {
    console.warn.apply(null, args);
  }

  static error(...args: any) {
    console.error.apply(null, args);
  }
}
