import config from "config";
import log from "./utils/logger.utils";
import connect from "./utils/connect.utils";
import createServer from "./server";
import { DefaultConfig } from "./libs";

const PORT = config.get<number>(DefaultConfig.PORT);

const app = createServer();

app.listen(PORT, async () => {
  log.info(`SERVER IS RUNNING ON PORT: ${PORT}`);
  await connect();
});
