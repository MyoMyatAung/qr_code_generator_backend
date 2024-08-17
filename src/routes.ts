import { Express, Request, Response } from "express";
import { requiredUser } from "./middlewares/requiredUser";

import authRouter from "./routers/auth.routes";
import adminRouter from "./routers/admin.routes";

function routes(app: Express) {
    app.get("/api/v1/health-check", (req: Request, res: Response) => {
        return res.status(200).json({ message: "SERVER IS RUNNING WELL" });
    });

    app.use("/api/v1/auth", authRouter);

    app.use("/api/v1/admins", adminRouter);
}

export default routes;