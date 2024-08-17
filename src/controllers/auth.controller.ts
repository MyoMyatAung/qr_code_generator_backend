import { Request, Response } from "express";
import { AdminSignInInput } from "../schemas/admin.schema";
import { validateAdmin } from "../services/admin.service";
import { errorResponse } from "../utils/responses.utils";
import { signJwt } from "../utils/jwt.utils";
import config from "config";
import { DefaultConfig, HTTP_MESSAGES, HTTP_STATUS } from "../libs";

/**
 * @POST /api/v1/auth/admins/sign-in
 */
export async function adminSignInHandler(req: Request<{}, {}, AdminSignInInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const admin = await validateAdmin(req.body.email, req.body.password);
        if (!admin) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, HTTP_MESSAGES.UNAUTHORIZED, { message: "Unauthorized" });
        }
        const accessToken = signJwt(admin, {
            expiresIn: config.get<string>(DefaultConfig.ACCESS_TOKEN_TTL)
        });
        const refreshToken = signJwt(admin, {
            expiresIn: config.get<string>(DefaultConfig.REFRESH_TOKEN_TTL),
        });
        return res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
            message: "Something went wrong!",
        });
    }
}

/**
 * @GET /api/v1/auth/admins/me
 */
export async function adminGetMeHandler(req: Request, res: Response) {
    try {
        return res.status(200).json(res.locals.user);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}