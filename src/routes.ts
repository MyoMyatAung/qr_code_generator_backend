import { Express, Request, Response } from "express";
import { requiredUser } from "./middlewares/requiredUser";

import authRouter from "./routers/auth.routes";
import adminRouter from "./routers/admin.routes";
import qrRouter from "./routers/qr.routes";
import { getImgKeySchema } from "./schemas/img.schema";
import { validateJson } from "./middlewares/validateResources";
import { downloadMediaHandler, downloadQRHandler, getMediaHandler, getQRHandler } from "./controllers/img.controller";

function routes(app: Express) {
    app.get("/api/v1/health-check", (req: Request, res: Response) => {
        return res.status(200).json({ message: "SERVER IS RUNNING WELL" });
    });

    app.get("/api/v1/qrcode/:key", validateJson(getImgKeySchema), getQRHandler);
    app.get("/api/v1/media/:key", validateJson(getImgKeySchema), getMediaHandler);
    app.get("/api/v1/download/qr/:key", validateJson(getImgKeySchema), downloadQRHandler);
    app.get("/api/v1/download/media/:key", validateJson(getImgKeySchema), downloadMediaHandler);

    app.use("/api/v1/auth", authRouter);

    app.use("/api/v1/admins", requiredUser, adminRouter);

    app.use("/api/v1/qr", qrRouter);
}

export default routes;