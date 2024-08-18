import { Request, Response } from "express";
import { GetImgKeyInput } from "../schemas/img.schema";
import { getImage } from "../utils/file-upload.utils";
import { DefaultConfig } from "../libs";

export async function getQRHandler(req: Request<GetImgKeyInput["params"]>, res: Response) {
    const { base64, contentType } = await getImage(req.params.key, DefaultConfig.QR_BUCKET);
    const imgBuffer = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', contentType as string);
    return res.send(imgBuffer);
}

export async function getMediaHandler(req: Request<GetImgKeyInput["params"]>, res: Response) {
    const { base64, contentType } = await getImage(req.params.key, DefaultConfig.QR_MEIDA_BUCKET);
    const imgBuffer = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', contentType as string);
    return res.send(imgBuffer);
}