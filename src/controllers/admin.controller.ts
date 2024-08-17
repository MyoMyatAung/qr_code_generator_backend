import { Request, Response } from "express";
import { CreateAdminInput, DeleteAdminInput, GetAdminByIdInput, GetAdminQueryInput, UpdateAdminInput } from "../schemas/admin.schema";
import { coundAdmin, createAdmin, deleteAdmin, findAdmins, updateAdmin } from "../services/admin.service";
import { errorResponse, successResponse } from "../utils/responses.utils";
import { AdminDocument } from "../models/admin.model";
import { HTTP_MESSAGES, HTTP_STATUS } from "../libs";

/**
 * @POST /api/v1/admins
 */
export async function createAdminHandler(req: Request<CreateAdminInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const createdAdmin = await createAdmin(req.body);
        return successResponse(res, HTTP_STATUS.CREATED, HTTP_MESSAGES.CREATED, {}, createdAdmin);
    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, { message: "Something went wrong!" });
    }
}

/**
 * @GET /api/v1/admins
 */
export async function getAdminHandler(req: Request<{}, {}, {}, GetAdminQueryInput["filter"] & GetAdminQueryInput["paginate"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const { page = 0, limit = 10, ...filter } = req.query;
        const skip = page * limit;
        const admins = await findAdmins(filter, {}, { skip, limit });
        const total = await coundAdmin(filter);
        const totalPage = Math.ceil(total / limit);
        return successResponse<Array<AdminDocument>>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, { page, limit, total, totalPage }, admins);
    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
            message: "Something went wrong!",
        });
    }
}

/**
 * @GET /api/v1/admins/:id
 */
export async function getAdminByIdHandler(req: Request<GetAdminByIdInput["params"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const admins = await findAdmins(req.params);
        if (!admins.length) {
            return errorResponse(res, HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, {
                message: "Admin not found!",
            });
        }
        return successResponse<AdminDocument>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, admins[0]);
    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
            message: "Something went wrong!",
        });
    }
}

/**
 * @PUT /api/v1/admins/:id
 */
export async function updateAdminHandler(req: Request<UpdateAdminInput["params"], {}, UpdateAdminInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const updatedAdmin = await updateAdmin(req.params, req.body);
        if (!updatedAdmin) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
                message: "Invalid User",
            });
        }
        return successResponse<AdminDocument>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedAdmin);
    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
            message: "Something went wrong!",
        });
    }
}

/**
 * @DELETE /api/v1/admins/:id
 */
export async function deleteAdminHandler(req: Request<DeleteAdminInput["params"]>, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const deletedAdmin = await deleteAdmin(req.params);
        if(!deletedAdmin){
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
                message: "Invalid User",
            });
        }
        return successResponse<AdminDocument>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, deletedAdmin);
    } catch (error) {
        console.log(error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
            message: "Something went wrong!",
        });
    }
}