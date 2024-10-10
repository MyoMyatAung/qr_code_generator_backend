import { Request, Response } from "express";
import { GetImgKeyInput } from "../schemas/img.schema";
import { getFileStreamFromS3, getImage } from "../utils/file-upload.utils";
import { DefaultConfig } from "../libs";
import { pipeline } from "stream/promises";

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

export async function downloadQRHandler(req: Request<GetImgKeyInput["params"]>, res: Response) {
    try {
        const fileStream = await getFileStreamFromS3(req.params.key, DefaultConfig.QR_BUCKET);

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.key}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Pipe the file stream to the response
        await pipeline(fileStream, res);

        console.log(`File ${req.params.key} downloaded successfully.`);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
}

export async function downloadMediaHandler(req: Request<GetImgKeyInput["params"]>, res: Response) {
    try {
        const fileStream = await getFileStreamFromS3(req.params.key, DefaultConfig.QR_MEIDA_BUCKET);

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.key}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Pipe the file stream to the response
        await pipeline(fileStream, res);

        console.log(`File ${req.params.key} downloaded successfully.`);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
}