import { TypeOf, object, string } from "zod";

const params = object({
    key: string({ required_error: "key is required" }),
});

export const getImgKeySchema = object({ params });

export type GetImgKeyInput = TypeOf<typeof getImgKeySchema>;
