// Single-port API startup � fail fast when the port is already in use
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import createApp from "./app.js";
import connectDatabase from "./config/database.js";
import config from "./config/index.js";
import * as logger from "./utils/logger.js";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const syncDevApiUrl = (port) => {
  if (!config.isDev) return;
  const envLocalPath = path.join(projectRoot, ".env.development.local");
  fs.writeFileSync(
    envLocalPath,
    `# Auto-generated when the API starts\nREACT_APP_API_URL=http://localhost:${port}\n`,
    "utf8"
  );
};

const preferredPort =
  parseInt(process.env.API_PORT, 10) ||
  parseInt(process.env.PORT, 10) ||
  config.port ||
  3344;

const listenOnPort = (app, port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve({ server, port }));
    server.once("error", (err) => {
      server.close();
      reject(err);
    });
  });

const startServer = async () => {
  await connectDatabase();

  const app = createApp();
  let server;
  let port;

  try {
    ({ server, port } = await listenOnPort(app, preferredPort));
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${preferredPort} is already in use � stop the other API process or set API_PORT`, {
        port: preferredPort,
      });
      process.exit(1);
    }
    throw err;
  }

  syncDevApiUrl(port);

  logger.info(`Brisova API listening on http://localhost:${port}`, {
    env: config.env,
    apiPrefix: config.apiPrefix,
    storage: config.storage,
  });

  server.on("error", (err) => {
    logger.error("Server error", { message: err.message });
    process.exit(1);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received � shutting down`);
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (error) => {
    logger.error("Unhandled rejection", { message: error.message });
    server.close(() => process.exit(1));
  });

  return server;
};

startServer().catch((error) => {
  logger.error("Failed to start server", { message: error.message });
  process.exit(1);
});
