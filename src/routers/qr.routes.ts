import { Router } from "express";
import { validateFormData, validateJson } from "../middlewares/validateResources";
import upload from "../utils/multer.utils";
import { createQRSchema, deleteQRSchema, getQRByDocIdSchema, getQRByDocQrIdSchema, getQRQuerySchema, scanQrSchema, toggleStatusQRSchema, updateQRSchema } from "../schemas/qr.schema";
import { createQRHandler, deleteQRHandler, getQRByIdHandler, getQRByQrIdHandler, getQRHandler, scanQRHandler, toggleStatusQRHandler, updateQRHandler } from "../controllers/qr.controller";

const qrRouter = Router();

qrRouter.get('/', validateFormData(getQRQuerySchema), getQRHandler);
qrRouter.get('/:_id', validateJson(getQRByDocIdSchema), getQRByIdHandler);
qrRouter.get('/qrId/:qrId', validateJson(getQRByDocQrIdSchema), getQRByQrIdHandler);
qrRouter.patch('/scan/:qrId', validateJson(scanQrSchema), scanQRHandler);
qrRouter.patch('/toggle-status/:_id', validateJson(toggleStatusQRSchema), toggleStatusQRHandler);
qrRouter.post("/", upload.single("data"), validateFormData(createQRSchema), createQRHandler);
qrRouter.put('/:_id', upload.single("data"), validateFormData(updateQRSchema), updateQRHandler);
qrRouter.delete('/:_id', validateJson(deleteQRSchema), deleteQRHandler);

export default qrRouter;