import { number, object, string, TypeOf } from "zod";
import { emailValidator, passwordValidator, phoneValidator, usernameValidator } from "./common.schema";

const params = object({
    _id: string({ required_error: "User id is required" }),
});

// Signin Schema
const signinBody = {
    body: object({
        email: emailValidator,
        password: passwordValidator,
    })
}

// Body schema
const body = object({
    username: usernameValidator,
    email: emailValidator,
    phone: phoneValidator,
});

// Create body schema
const createBody = {
    body: body.extend({
        password: passwordValidator,
        confirmPassword: passwordValidator,
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
}

// Get query
const query = {
    filter: object({
        username: string().optional(),
        phone: string().optional(),
        email: string().optional(),
    }),
    paginate: object({
        page: number().optional(),
        limit: number().optional(),
    }),
};

export const createAdminSchema = object({ ...createBody });

export const updateAdminSchema = object({ params, body });

export const deleteAdminSchema = object({ params });

export const getAdminByIdSchema = object({ params });

export const getAdminQuerySchema = object({ ...query });

export const adminSigninSchema = object({ ...signinBody })

export type CreateAdminInput = Omit<TypeOf<typeof createAdminSchema>, "body.confirmPassword">;

export type UpdateAdminInput = TypeOf<typeof updateAdminSchema>;

export type DeleteAdminInput = TypeOf<typeof deleteAdminSchema>;

export type GetAdminByIdInput = TypeOf<typeof getAdminByIdSchema>;

export type GetAdminQueryInput = TypeOf<typeof getAdminQuerySchema>;

export type AdminSignInInput = TypeOf<typeof adminSigninSchema>;
