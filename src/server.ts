import express from "express";
import cors from "cors";
import routes from "./routes";
import { deserialize } from "./middlewares/deserializeUser";
import { DefaultConfig } from "./libs";
import config from 'config';

const PORT = config.get<number>(DefaultConfig.PORT);

function createServer() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cors());
  app.use(deserialize);

  routes(app);

  return app;
}

export default createServer;
