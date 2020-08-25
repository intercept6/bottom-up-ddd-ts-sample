type Importance = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export function systemLog(importance: Importance, message: string) {
  switch (importance) {
    case 'DEBUG':
      console.debug('[DEBUG]: ', message);
      break;
    case 'INFO':
      console.info('[INFO]: ', message);
      break;
    case 'WARN':
      console.warn('[WARN]: ', message);
      break;
    case 'ERROR':
      console.error('[ERROR]: ', message);
      break;
    default:
      // eslint-disable-next-line no-case-declarations,@typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = importance;
      break;
  }
}
