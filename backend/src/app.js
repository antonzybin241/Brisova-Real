import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import corsMiddleware from "./config/cors.js";
import mountRoutes from "./routes/index.js";
import {
  requestLogger,
  apiLimiter,
  notFound,
  errorHandler,
} from "./middleware/index.js";
import { enableBigIntJson } from "./utils/serialize.js";
import config from "./config/index.js";

enableBigIntJson();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "../..");
const buildDir = path.join(projectRoot, "build");
const hasWebBuild = () => fs.existsSync(path.join(buildDir, "index.html"));

const createApp = () => {
  const app = express();
  const serveSpa = config.isProd && hasWebBuild();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(corsMiddleware);
  app.use(compression());
  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(apiLimiter);

  mountRoutes(app, { serveSpa, buildDir });

  if (serveSpa) {
    app.use(express.static(buildDir, { maxAge: "1d", index: false }));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith(config.apiPrefix)) return next();
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      return res.sendFile(path.join(buildDir, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
