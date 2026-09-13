import express from "express";
import path from "path";
import config from "../config/index.js";
import v1Routes from "./v1/index.js";

const mountRoutes = (app, { serveSpa = false, buildDir } = {}) => {
  app.get("/", (req, res) => {
    if (serveSpa && buildDir) {
      return res.sendFile(path.join(buildDir, "index.html"));
    }

    return res.json({
      success: true,
      name: "Brisova Markets API",
      version: "2.0.0",
      docs: {
        v1: config.apiPrefix,
        routes: [
          "/health",
          "/properties",
          "/dashboard",
          "/profile",
          "/investments",
          "/kyc",
          "/admin",
          "/favorites",
          "/newsletter",
        ],
      },
    });
  });

  app.get("/api", (req, res) => {
    res.json({
      success: true,
      name: "Brisova API",
      version: "2.0.0",
      prefix: config.apiPrefix,
    });
  });

  app.use(config.apiPrefix, v1Routes);
};

export default mountRoutes;
