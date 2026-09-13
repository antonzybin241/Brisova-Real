import cors from "cors";
import config from "./index.js";

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.corsOrigin === "*") {
      return callback(null, true);
    }
    const allowed = config.corsOrigin.split(",").map((o) => o.trim());
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
};

export default cors(corsOptions);
