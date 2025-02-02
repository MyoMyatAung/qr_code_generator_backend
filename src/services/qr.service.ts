import { FilterQuery, ProjectionFields, QueryOptions, UpdateQuery } from "mongoose";
import QRModel, { QRDoc, QRInput } from "../models/qr.model";
import { handleError } from "../utils/index.utils";

export async function createQR(input: QRInput): Promise<QRDoc> {
  try {
    return await QRModel.create(input);
  } catch (error: unknown) {
    handleError(error);
  }
}

export async function countQR(query?: FilterQuery<QRDoc>): Promise<number> {
  return QRModel.countDocuments(query);
}

export async function findQRs(query?: FilterQuery<QRDoc>, projection?: ProjectionFields<QRDoc>, options: QueryOptions = { lean: true }): Promise<Array<QRDoc>> {
  try {
    return await QRModel.find({ ...query } || {}, projection, options).populate(["createdBy", "updatedBy"]).sort({ createdAt: -1 });
  } catch (error: unknown) {
    handleError(error);
  }
}

export async function updateQR(query: FilterQuery<QRDoc>, update: UpdateQuery<QRDoc>, options: QueryOptions = { new: true }): Promise<QRDoc | null> {
  try {
    return await QRModel.findOneAndUpdate(query, { ...update }, options);
  } catch (error: unknown) {
    handleError(error);
  }
}

export async function deleteQR(query: FilterQuery<QRDoc>, options: QueryOptions = { new: true }): Promise<QRDoc | null> {
  try {
    return await QRModel.findOneAndDelete(query, options);
  } catch (error: unknown) {
    handleError(error);
  }
}