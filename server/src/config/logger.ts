import { ENV } from './env.js';

export const logger = {
  info: (msg: string, meta?: any) => {
    if (['info', 'debug'].includes(ENV.LOG_LEVEL)) {
      console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
    }
  },
  warn: (msg: string, meta?: any) => {
    if (['warn', 'info', 'debug'].includes(ENV.LOG_LEVEL)) {
      console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
    }
  },
  error: (msg: string, err?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, err ? err : '');
  },
  debug: (msg: string, meta?: any) => {
    if (ENV.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
    }
  },
};
