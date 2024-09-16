import { Request, Response } from "express";
import { CreateQRInput, DeleteQRInput, GetQRByDocIdInput, GetQRByDocQrIdInput, GetQRQueryInput, ScanQRInput, ToggleStatusQRInput, UpdateQRInput } from "../schemas/qr.schema";
import { countQR, createQR, deleteQR, findQRs, updateQR } from "../services/qr.service";
import { errorResponse, successResponse } from "../utils/responses.utils";
import { DefaultConfig, HTTP_MESSAGES, HTTP_STATUS, QRType } from "../libs";
import { QRDoc, QRInput } from "../models/qr.model";

import config from "config";
import { generateQRCode } from "../utils/index.utils";
import generateUniqueID from "../utils/nanoid.utils";
import { isEmployee, isMedia } from "../utils/typeGuards.utils";
import { deleteFromS3, uploadToS3 } from "../utils/qr.utils";

/**
 * @POST /api/v1/qr
 */
export async function createQRHandler(req: Request<{}, {}, CreateQRInput["body"]>, res: Response): Promise<Response<any>> {
  try {
    const qrId = generateUniqueID();
    const qrBuffer = await generateQRCode(`${config.get<string>(DefaultConfig.FRONT_END_URL)}/${qrId}`);

    const qr = await uploadToS3(
      config.get<string>(DefaultConfig.QR_BUCKET),
      `${generateUniqueID()}.png`,
      qrBuffer,
      "image/png"
    );

    if (!qr.success || !qr.key || !qr.url) {
      return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
        message: "Error in uploading QR CODE",
      });
    }

    let createPayload: QRInput = {
      ...req.body,
      createdBy: res.locals.user._id,
      updatedBy: res.locals.user._id,
      qrcode: { key: qr.key, url: qr.url },
      qrId,
    };

    if ([QRType.IMAGE, QRType.PDF, QRType.V_CARD].includes(req.body.type) && !req.file) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "File Required",
      });
    }

    if (req.file) {
      const media = await uploadToS3(
        config.get<string>(DefaultConfig.QR_MEIDA_BUCKET),
        req.file.originalname,
        req.file.buffer,
        req.body.type === QRType.PDF ? "application/pdf" : "image/png"
      );
      if (!media.success || !media.key || !media.url) {
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
          message: "Error in uploading Media",
        });
      }
      if (isEmployee(req.body.data) || isMedia(req.body.data)) {
        createPayload.data = { ...req.body.data, media: { url: media.url, key: media.key } };
      } else {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
          message: "Invalid format",
        });
      }
    }

    const createdQr = await createQR(createPayload);
    return successResponse(res, HTTP_STATUS.CREATED, HTTP_MESSAGES.CREATED, {}, createdQr);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @GET /api/v1/qr
 */
export async function getQRHandler(req: Request<{}, {}, {}, GetQRQueryInput["filter"] & GetQRQueryInput["paginate"]>, res: Response): Promise<Response<any>> {
  try {
    const { page = 1, limit = 10, ...filter } = req.query;
    const skip = (page - 1) * limit;
    const qrs = await findQRs(filter, {}, { skip, limit });
    const total = await countQR(filter);
    const totalPage = Math.ceil(total / limit);

    return successResponse<Array<QRDoc>>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, { page, limit, total, totalPage }, qrs);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @GET /api/v1/qr/:id
 */
export async function getQRByIdHandler(req: Request<GetQRByDocIdInput["params"]>, res: Response): Promise<Response<any>> {
  try {
    const qr = await findQRs(req.params);

    if (!qr.length) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, {
        message: "QR not found!",
      });
    }

    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, qr[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @GET /api/v1/qr/:qrId
 */
export async function getQRByQrIdHandler(req: Request<GetQRByDocQrIdInput["params"]>, res: Response): Promise<Response<any>> {
  try {
    const qr = await findQRs(req.params);

    if (!qr.length) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, {
        message: "QR not found!",
      });
    }

    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, qr[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PUT /api/v1/qr/:_id
 */
export async function updateQRHandler(req: Request<UpdateQRInput["params"], {}, UpdateQRInput["body"]>, res: Response): Promise<Response<any>> {
  try {
    const existingQrs = await findQRs(req.params);

    if (!existingQrs.length) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }

    const existingQr = existingQrs[0];
    const updateQrPayload = { ...existingQr, ...req.body };

    if ([QRType.WEBSITE, QRType.V_CARD].includes(req.body.type) && isMedia(existingQr.data)) {
      await deleteFromS3(config.get<string>(DefaultConfig.QR_MEIDA_BUCKET), existingQr.data.media?.key as string);
    }

    if ([QRType.IMAGE, QRType.PDF, QRType.V_CARD].includes(req.body.type) && req.file) {
      if (isMedia(existingQr.data) || isEmployee(existingQr.data)) {
        await deleteFromS3(config.get<string>(DefaultConfig.QR_MEIDA_BUCKET), existingQr.data.media?.key as string);
      }

      const uploadedMedia = await uploadToS3(
        config.get<string>(DefaultConfig.QR_MEIDA_BUCKET),
        req.file.originalname,
        req.file.buffer,
        req.body.type === QRType.PDF ? "application/pdf" : "image/png"
      );
      if (!uploadedMedia.success || !uploadedMedia.key || !uploadedMedia.url) {
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
          message: "Error in uploading Media",
        });
      }
      if (isMedia(updateQrPayload.data) || isEmployee(updateQrPayload.data)) {
        updateQrPayload.data.media = { key: uploadedMedia.key, url: uploadedMedia.url };
      }
    }
    const updatedQR = await updateQR(req.params, { ...updateQrPayload, updatedBy: res.locals.user._id });

    if (!updatedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR",
      });
    }

    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQR);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PATCH /api/v1/qr/scan/:_id
 */
export async function scanQRHandler(req: Request<ScanQRInput["params"]>, res: Response): Promise<Response<any>> {
  try {
    const qrs = await findQRs(req.params);

    if (!qrs.length) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR!",
      });
    }

    const qr = qrs[0];
    qr.scanCount += 1;

    const today = new Date().toISOString().split("T")[0];
    const scanIndex = qr.scanHistory.findIndex((item) => item.date === today);

    if (scanIndex > -1) {
      qr.scanHistory[scanIndex].scanCount += 1;
    } else {
      qr.scanHistory.push({ date: today, scanCount: 1 });
    }

    const updatedQR = await updateQR(req.params, qr);
    if (!updatedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR!",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQR);
  } catch (error) {
    console.error(error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, {
      message: "Something went wrong!",
    });
  }
}

/**
 * @PATCH /api/v1/qr/status/:_id
 */
export async function toggleStatusQRHandler(req: Request<ToggleStatusQRInput["params"]>, res: Response): Promise<Response<any>> {
  try {
    const qrs = await findQRs(req.params);

    if (!qrs.length) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR!",
      });
    }

    const updatedQR = await updateQR(req.params, {
      ...qrs[0],
      status: !qrs[0].status,
      updatedBy: res.locals.user._id,
    });
    if (!updatedQR) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
        message: "Invalid QR!",
      });
    }
    return successResponse<QRDoc>(res, HTTP_STATUS.OK, HTTP_MESSAGES.OK, {}, updatedQR);
  } catch (error) {
    console.error(error);
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