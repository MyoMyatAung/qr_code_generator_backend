import { Express, Request, Response } from "express";
import { requiredUser } from "./middlewares/requiredUser";

import authRouter from "./routers/auth.routes";
import adminRouter from "./routers/admin.routes";
import qrRouter from "./routers/qr.routes";
import { getImgKeySchema } from "./schemas/img.schema";
import { validateJson } from "./middlewares/validateResources";
import { getMediaHandler, getQRHandler } from "./controllers/img.controller";

function routes(app: Express) {
    app.get("/api/v1/health-check", (req: Request, res: Response) => {
        return res.status(200).json({ message: "SERVER IS RUNNING WELL" });
    });

    app.get("/api/v1/qrcode/:key", validateJson(getImgKeySchema), getQRHandler);
    app.get("/api/v1/media/:key", validateJson(getImgKeySchema), getMediaHandler);

    app.use("/api/v1/auth", authRouter);

    app.use("/api/v1/admins", requiredUser, adminRouter);

    app.use("/api/v1/qr", requiredUser, qrRouter);
}

export default routes;