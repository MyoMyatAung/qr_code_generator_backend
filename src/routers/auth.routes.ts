import { Router } from "express";
import { validateJson } from "../middlewares/validateResources";
import { adminSigninSchema } from "../schemas/admin.schema";
import { adminGetMeHandler, adminSignInHandler } from "../controllers/auth.controller";

const authRouter = Router();

/**
 * AMIN AUTHENTICATION
 */
authRouter.post('/admins/sign-in', validateJson(adminSigninSchema), adminSignInHandler);
authRouter.get('/admins/me', adminGetMeHandler);

export default authRouter;