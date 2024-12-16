import { Router } from "express";
import { validateFormData, validateJson } from "../middlewares/validateResources";
import { createAdminSchema, deleteAdminSchema, getAdminByIdSchema, getAdminQuerySchema, updateAdminSchema } from "../schemas/admin.schema";
import { createAdminHandler, deleteAdminHandler, getAdminByIdHandler, getAdminHandler, updateAdminHandler } from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get('/', validateFormData(getAdminQuerySchema), getAdminHandler);
adminRouter.get('/:_id', validateJson(getAdminByIdSchema), getAdminByIdHandler);
adminRouter.post('/', validateJson(createAdminSchema), createAdminHandler);
adminRouter.put('/:_id', validateJson(updateAdminSchema), updateAdminHandler);
adminRouter.delete('/:_id', validateJson(deleteAdminSchema), deleteAdminHandler);

export default adminRouter;