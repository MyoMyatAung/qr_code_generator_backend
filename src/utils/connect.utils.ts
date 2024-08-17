import mongoose from "mongoose";
import config from "config";
import log from "./logger.utils";

const dbUri = config.get<string>("dbUri");

async function connect() {
  try {
    const conn = await mongoose.connect(dbUri);
    log.info(`DB CONNECTION SUCCESS`);
  } catch (error) {
    log.error(`ERROR IN DB CONNECTION ${error}`);
    process.exit(1);
  }
}

export default connect;
