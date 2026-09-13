import morgan from "morgan";
import config from "../config/index.js";

const requestLogger = config.isDev
  ? morgan("dev")
  : morgan(":method :url :status :res[content-length] - :response-time ms");

export default requestLogger;
