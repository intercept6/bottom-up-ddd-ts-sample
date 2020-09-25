export class Logger {
  private constructor() {}

  static debug(message?: any, ...optionalParams: any[]) {
    console.debug(message, optionalParams);
  }

  static info(message?: any, ...optionalParams: any[]) {
    console.info(message, optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]) {
    console.warn(message, optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]) {
    console.error(message, optionalParams);
  }
}
