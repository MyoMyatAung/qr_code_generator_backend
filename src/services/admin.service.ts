import { Omit, omit } from "lodash";
import AdminModel, { AdminDocument, AdminInput } from "../models/admin.model";
import { FilterQuery, ProjectionFields, QueryOptions, UpdateQuery } from "mongoose";
import { handleError } from "../utils/index.utils";

export async function validateAdmin(email: string, password: string): Promise<Omit<AdminDocument, "password"> | boolean> {
    try {
        const admin = await AdminModel.findOne({ email })
        if (!admin) {
            return false;
        }
        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            return false;
        }
        return omit(admin.toJSON(), "password");
    } catch (error) {
        return false;
    }
}

export async function createAdmin(input: AdminInput): Promise<Omit<AdminDocument, "password">> {
    try {
        const admin = await AdminModel.create(input);
        return omit(admin.toJSON(), "password");
    } catch (error: unknown) {
        handleError(error);
    }
}

export async function coundAdmin(query?: FilterQuery<AdminDocument>): Promise<number> {
    return await AdminModel.countDocuments(query);
}

export async function findAdmins(query?: FilterQuery<AdminDocument>, projection?: ProjectionFields<AdminDocument>, options: QueryOptions = { lean: true }): Promise<Array<AdminDocument>> {
    try {
        return await AdminModel.find({ ...query } || {}, projection, options);
    } catch (error: unknown) {
        handleError(error);
    }
}

export async function updateAdmin(query: FilterQuery<AdminDocument>, update: UpdateQuery<AdminDocument>, options: QueryOptions = { new: true }): Promise<AdminDocument | null> {
    try {
        return await AdminModel.findOneAndUpdate(query, { ...update }, options);
    } catch (error: unknown) {
        handleError(error);
    }
}

export async function deleteAdmin(query: FilterQuery<AdminDocument>, options: QueryOptions = { new: true }): Promise<AdminDocument | null> {
    try {
        return await AdminModel.findOneAndDelete(query, options);
    } catch (error: unknown) {
        handleError(error);
    }
}
