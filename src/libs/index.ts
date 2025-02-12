export enum HTTP_STATUS {
    // SUCCESS
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,

    // REDIRECTION
    MOVED_PERMANENTLY = 301,
    MOVED_TEMPORARILY = 302,
    NOT_MODIFIED = 304,

    // CLIENT ERROR
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,

    // SERVER ERROR
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
}

export enum HTTP_MESSAGES {
    // SUCCESS
    OK = "OK",
    CREATED = "CREATED",
    ACCEPTED = "ACCEPTED",
    NO_CONTENT = "NO_CONTENT",

    // REDIRECTION
    MOVED_PERMANENTLY = "MOVED_PERMANENTLY",
    MOVED_TEMPORARILY = "MOVED_TEMPORARILY",
    NOT_MODIFIED = "NOT_MODIFIED",

    // CLIENT ERROR
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
    CONFLICT = "CONFLICT",

    // SERVER ERROR
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    BAD_GATEWAY = "BAD_GATEWAY",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}

export enum DefaultConfig {
    PORT = "port",
    DB_URI = "dbUri",
    SALT_WORK_FACTOR = "saltWorkFactor",
    ACCESS_TOKEN_TTL = "accessTokenTtl",
    REFRESH_TOKEN_TTL = "refreshTokenTtl",
    PUBLIC_KEY = "publicKey",
    PRIVATE_KEY = "privateKey",
    QR_BUCKET = "qrBucket",
    QR_MEIDA_BUCKET = "qrMediaBucket",
    AWS_ACCESS_KEY = "awsAccessKey",
    AWS_SECRET_ACCESS_KEY = "awsSecretAccessKey",
    REGION = "region",
    FRONT_END_URL = "frontEndUrl",
}

export enum QRType {
    WEBSITE = "WEBSITE",
    V_CARD = "V_CARD",
    PDF = "PDF",
    IMAGE = "IMAGE",
    SOCIAL = "SOCIAL"
}

export enum SocialType {
    WEBSITE = "WEBSITE",
    FACEBOOK = "FACEBOOK",
    X = "X",
    TWITTER = "TWITTER",
    INSTAGRAM = "INSTAGRAM",
    WHATSAPP = "WHATSAPP",
    TIKTOK = "TIKTOK",
    YOUTUBE = "YOUTUBE",
    TELEGRAM = "TELEGRAM",
    MESSENGER = "MESSENGER",
    LINKEDIN = "LINKEDIN",
}