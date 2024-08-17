import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface AdminInput {
    username: string;
    email: string;
    phone: string;
    password: string;
}

export interface AdminDocument extends AdminInput, mongoose.Document {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(inputPassword: string): Promise<Boolean>;
}

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 6,
        maxlength: 11,
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
    let admin = this as AdminDocument;
    if (!admin.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = await bcrypt.hashSync(admin.password, salt);
    admin.password = hash;

    return next();
});

adminSchema.methods.comparePassword = async function (
    inputPassword: string
): Promise<Boolean> {
    const admin = this as AdminDocument;
    return await bcrypt
        .compare(inputPassword, admin.password)
        .catch((e) => false);
};

const AdminModel = mongoose.model<AdminDocument>("Admin", adminSchema);

export default AdminModel;