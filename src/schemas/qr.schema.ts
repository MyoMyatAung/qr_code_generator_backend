import z, { boolean, number, object, string, TypeOf } from "zod";
import {
  emailValidator,
  nameValidator,
  phoneValidator,
  qrTypeValidator,
  usernameValidator,
} from "./common.schema";
import {SocialType} from "../libs";

const params = object({
  _id: string({ required_error: "qr id is required" }),
});

const qrIdParams = object({
  qrId: string({ required_error: "qr id is required" }),
});

// Body schema
const body = {
  body: object({
    type: qrTypeValidator,
    qrName: usernameValidator,
    data: z.union([
      string({ required_error: "body is required" }),
      object({
        firstName: nameValidator,
        lastName: nameValidator,
        phone: phoneValidator,
        email: emailValidator,
        company: usernameValidator,
        job: usernameValidator,
        address: string({ required_error: "address is required" }),
        summary: string({ required_error: "summary is required" }),
      }),
      object({
        company: string({ required_error: "company is required" }),
        title: string({ required_error: "title is required" }),
        description: string({ required_error: "description is required" }),
      }),
      object({
        title: string({ required_error: "title is required" }),
        description: string({ required_error: "description is required" }),
        socialMedia: z.array(
          object({
            text: string({ required_error: "text is required" }),
            url: string({ required_error: "url is required" }),
            type: z.enum([
                SocialType.WEBSITE,
                SocialType.FACEBOOK,
                SocialType.X,
                SocialType.INSTAGRAM,
                SocialType.LINKEDIN,
                SocialType.MESSENGER,
                SocialType.TELEGRAM,
                SocialType.TIKTOK,
                SocialType.TWITTER,
                SocialType.WHATSAPP,
                SocialType.YOUTUBE,
                SocialType.VIBER,
            ], { required_error: "qr type is required" }),
          })
        ).min(1, { message: "social media must have at least 1 item"}),
      })
    ]),
  }),
};

// Get query
const query = {
  filter: object({
    type: string().optional(),
    qrName: string().optional(),
  }),
  paginate: object({
    page: number().optional(),
    limit: number().optional(),
  }),
};

export const createQRSchema = object({ ...body });

export const updateQRSchema = object({ params, ...body });

export const toggleStatusQRSchema = object({
  params,
  body: object({ status: boolean({ required_error: "status is required" }) }),
});

export const scanQrSchema = object({ params: qrIdParams });

export const deleteQRSchema = object({ params });

export const getQRByDocIdSchema = object({ params });

export const getQRByDocQrIdSchema = object({ params: qrIdParams });

export const getQRQuerySchema = object({ ...query });

export type CreateQRInput = TypeOf<typeof createQRSchema>;

export type UpdateQRInput = TypeOf<typeof updateQRSchema>;

export type ToggleStatusQRInput = TypeOf<typeof toggleStatusQRSchema>;

export type ScanQRInput = TypeOf<typeof scanQrSchema>;

export type DeleteQRInput = TypeOf<typeof deleteQRSchema>;

export type GetQRByDocIdInput = TypeOf<typeof getQRByDocIdSchema>;

export type GetQRByDocQrIdInput = TypeOf<typeof getQRByDocQrIdSchema>;

export type GetQRQueryInput = TypeOf<typeof getQRQuerySchema>;
