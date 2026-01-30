import { env } from "./env.js";

type LogData = Record<string, unknown>;

const format = (level: string, msg: string, data?: LogData): string => {
  if (env.isDev) {
    const prefix = `${new Date().toISOString()} [${level.toUpperCase()}]`;
    return data ? `${prefix} ${msg} ${JSON.stringify(data)}` : `${prefix} ${msg}`;
  }
  return JSON.stringify({ level, msg, time: new Date().toISOString(), ...data });
};

export const log = {
  info: (msg: string, data?: LogData) => console.log(format("info", msg, data)),
  warn: (msg: string, data?: LogData) => console.warn(format("warn", msg, data)),
  error: (msg: string, data?: LogData) => console.error(format("error", msg, data)),
};
