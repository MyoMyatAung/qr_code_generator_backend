import mongoose from "mongoose";
import { QRType } from "../libs";
import { AdminDocument } from "./admin.model";

export interface QRInput {
  type: QRType;
  qrName: string;
  qrId: string;
  qrcode: {
    url: string;
    key: string;
  };
  data: string | Employee | Media;
  createdBy: AdminDocument["_id"];
  updatedBy: AdminDocument["_id"];
}

export interface Employee {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  job: string;
  address: string;
  summary: string;
}

export interface Media {
  company: string;
  title: string;
  description: string;
  media?: {
    url: string;
    key: string;
  };
}

export interface QRDoc extends QRInput, mongoose.Document {
  _id: string;
  status: boolean;
  scanCount: number;
  scanHistory: { date: string; scanCount: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const scanHistorySchema = new mongoose.Schema({
  date: { type: String },
  scanCount: { type: Number },
});

const qrcodeSchema = new mongoose.Schema({
  url: String,
  key: String, 
})

const qrSchema = new mongoose.Schema(
  {
    qrName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [QRType.IMAGE, QRType.PDF, QRType.V_CARD, QRType.WEBSITE],
      required: true,
    },
    qrcode: qrcodeSchema,
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: Boolean, default: true },
    scanCount: { type: Number, default: 0 },
    scanHistory: [scanHistorySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const QRModel = mongoose.model<QRDoc>("QR", qrSchema);

export default QRModel;