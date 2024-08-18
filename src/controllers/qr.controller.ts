import { Request, Response } from "express";
import { CreateQRInput, DeleteQRInput, GetQRByDocIdInput, GetQRQueryInput, ScanQRInput, ToggleStatusQRInput, UpdateQRInput } from "../schemas/qr.schema";
import { countQR, createQR, deleteQR, findQRs, updateQR } from "../services/qr.service";
import { errorResponse, successResponse } from "../utils/responses.utils";
import { DefaultConfig, HTTP_MESSAGES, HTTP_STATUS, QRType } from "../libs";
import { Employee, Media, QRDoc, QRInput } from "../models/qr.model";
import upload, { UploadParams } from "../utils/file-upload.utils";

import config from "config";
import { generateQRCode } from "../utils/index.utils";
import generateUniqueID from "../utils/nanoid.utils";

// Type guard to check if data is of type Employee
function isEmployee(data: any): data is Employee {
  return data && typeof data === "object" && 'firstName' in data && 'lastName' in data;
}

// Type guard to check if data is of type Media
function isMedia(data: any): data is Media {
  return data && typeof data === "object" && 'title' in data && 'description' in data;
}

/**
 * @POST /api/v1/qr
 */
export async function createQRHandler(req: Request<{}, {}, CreateQRInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {

    const qrId = generateUniqueID();
    const qrBuffer = await generateQRCode("http://localhost:3000/" + qrId);
    // Upload QR image to S3
    const uploadParams: UploadParams = {
      Bucket: config.get<string>(DefaultConfig.QR_BUCKET),
      Key: `${generateUniqueID()}.png`, // Unique key for the image file
      Body: qrBuffer,
      ContentType: "image/png", // Assuming the file type is PNG
    };
    const qr = await upload(uploadParams);
    if (!qr.success || !qr.url || !qr.key) {
      return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
        message: "Error in uploading image",
      });
    }
    let createPayload: QRInput = { ...req.body, createdBy: res.locals.user._id, updatedBy: res.locals.user._id, qrcode: { key: qr.key, url: qr.url }, qrId };
    if ((req.body.type === QRType.IMAGE) || (req.body.type === QRType.PDF) && !req.file) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "File required",
      });
    }
    if (!!req.file) {
      // Upload Media file to S3
      const uploadParams: UploadParams = {
        Bucket: config.get<string>(DefaultConfig.QR_MEIDA_BUCKET),
        Key: `${req.file.originalname}.${req.body.type === QRType.PDF ? "pdf" : "png"}`, // Unique key for the media file
        Body: req.file.buffer,
        ContentType: req.body.type === QRType.PDF ? "application/pdf" : "image/png",
      };
      const media = await upload(uploadParams);
      if (!media.success || !media.url || !media.key) {
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
          message: "Error in uploading image",
        });
      }
      if (isEmployee(req.body.data)) {
        createPayload = {
          ...createPayload,
          data: {
            ...req.body.data,
            media: { url: media.url, key: media.key },
          },
        };
      } else if (isMedia(req.body.data)) {
        createPayload = {
          ...createPayload,
          data: {
            ...req.body.data,
            media: { url: media.url, key: media.key },
          },
        };
      } else {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
          message: "Invalid data format",
        });
      }
    }
    const createdQr = await createQR(createPayload);
    return successResponse(res, HTTP_STATUS.CREATED, HTTP_MESSAGES.CREATED, {}, createdQr);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, { message: "Something went wrong!" });
  }
}

/**
 * @GET /api/v1/qr
 */
export async function getQRHandler(req: Request<{}, {}, {}, GetQRQueryInput["filter"] & GetQRQueryInput["paginate"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const { page = 1, limit = 10, ...filter } = req.query;
    const skip = (page - 1) * limit;
    const qrs = await findQRs(filter, {}, { skip, limit });
    const total = await countQR(filter);
    const totalPage = Math.ceil(total / limit);
    return successResponse<Array<QRDoc>>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, { page, limit, total, totalPage }, qrs);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @GET /api/v1/qr/:id
 */
export async function getQRByIdHandler(req: Request<GetQRByDocIdInput["params"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const qrs = await findQRs(req.params);
    if (!qrs.length) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, {
        message: "QR not found!",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, qrs[0]);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PUT /api/v1/qr/:_id
 */
export async function updateQRHandler(req: Request<UpdateQRInput["params"], {}, UpdateQRInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const updatedQR = await updateQR(req.params, req.body);
    if (!updatedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQR);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PATCH /api/v1/qr/scan/:_id
 */
export async function scanQRHandler(req: Request<ScanQRInput["params"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const existingQrs = await findQRs(req.params);
    if (!existingQrs.length) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }
    const existingQr = existingQrs[0];
    existingQr.scanCount += 1;
    const today = new Date().toISOString().split("T")[0];
    const isTodayIsAlreadyExist = existingQr.scanHistory.some(item => item.date === today);
    if (isTodayIsAlreadyExist) {
      const scanHistoryIndex = existingQr.scanHistory.findIndex(item => item.date === today);
      const scanHistoryItem = existingQr.scanHistory[scanHistoryIndex];
      scanHistoryItem.scanCount += 1;
      existingQr.scanHistory[scanHistoryIndex] = scanHistoryItem;
    } else {
      existingQr.scanHistory.push({ date: today, scanCount: 1 });
    }
    const updatedQr = await updateQR(req.params, existingQr);
    if (!updatedQr) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQr);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PATCH /api/v1/qr/toggle-status/:_id
 */
export async function toggleStatusQRHandler(req: Request<ToggleStatusQRInput["params"], {}, ToggleStatusQRInput["body"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const updatedQR = await updateQR(req.params, { $set: { status: req.body.status } });
    if (!updatedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQR);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @DELETE /api/v1/qr/:_id
 */
export async function deleteQRHandler(req: Request<DeleteQRInput["params"]>, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    const deletedQR = await deleteQR(req.params);
    if (!deletedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, deletedQR);
  } catch (error) {
    console.log(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}