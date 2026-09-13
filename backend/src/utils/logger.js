import config from "../config/index.js";

const format = (level, message, meta = {}) => {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    env: config.env,
    ...meta,
  };
  return JSON.stringify(entry);
};

export const info = (message, meta) => {
  console.log(format("info", message, meta));
};

export const warn = (message, meta) => {
  console.warn(format("warn", message, meta));
};

export const error = (message, meta) => {
  console.error(format("error", message, meta));
};

export const debug = (message, meta) => {
  if (config.isDev) {
    console.debug(format("debug", message, meta));
  }
};
