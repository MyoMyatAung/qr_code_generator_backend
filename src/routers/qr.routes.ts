import { Router } from "express";
import { validateFormData, validateJson } from "../middlewares/validateResources";
import upload from "../utils/multer.utils";
import { createQRSchema, deleteQRSchema, getQRByDocIdSchema, getQRByDocQrIdSchema, getQRQuerySchema, scanQrSchema, toggleStatusQRSchema, updateQRSchema } from "../schemas/qr.schema";
import { createQRHandler, deleteQRHandler, getQRByIdHandler, getQRByQrIdHandler, getQRHandler, scanQRHandler, toggleStatusQRHandler, updateQRHandler } from "../controllers/qr.controller";
import { requiredUser } from "../middlewares/requiredUser";

const qrRouter = Router();

qrRouter.get('/', requiredUser, validateFormData(getQRQuerySchema), getQRHandler);
qrRouter.get('/:_id', requiredUser, validateJson(getQRByDocIdSchema), getQRByIdHandler);
qrRouter.get('/qrId/:qrId', validateJson(getQRByDocQrIdSchema), getQRByQrIdHandler);
qrRouter.patch('/scan/:qrId', validateJson(scanQrSchema), scanQRHandler);
qrRouter.patch('/toggle-status/:_id', requiredUser, validateJson(toggleStatusQRSchema), toggleStatusQRHandler);
qrRouter.post("/", requiredUser, upload.single("data"), validateFormData(createQRSchema), createQRHandler);
qrRouter.put('/:_id', requiredUser, upload.single("data"), validateFormData(updateQRSchema), updateQRHandler);
qrRouter.delete('/:_id', requiredUser, validateJson(deleteQRSchema), deleteQRHandler);

export default qrRouter;