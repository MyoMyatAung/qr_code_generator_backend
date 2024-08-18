import { array, date, number, string, z } from "zod";
import { QRType } from "../libs";

export const usernameValidator = string({ required_error: "Username is required" })
    .min(6, "Username should have at least 6 characters")
    .max(20, "Username should be maximum 20 characters");

export const nameValidator = string({ required_error: "Username is required" })
    .max(20, "Username should be maximum 20 characters");

export const emailValidator = string({ required_error: "Admin email is required" })
    .email("Invalid E-mail format");

export const phoneValidator = string({ required_error: "Admin phone number is required" })
    .min(6, "Invalid phone number")
    .max(11, "Invalid phone number");

export const passwordValidator = string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const qrTypeValidator = z.enum([QRType.IMAGE, QRType.PDF, QRType.V_CARD, QRType.WEBSITE], { required_error: "qr type is required" });
