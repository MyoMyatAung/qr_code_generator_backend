/**
 * Deserializing User is to validate the user is authenticated or not
 * if authenticated, manipulate the process of
 * validating and renewing token
 * via access token and refresh token
 */

import { Request, Response, NextFunction } from "express";
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import { omit } from "lodash";
import config from "config";
import { DefaultConfig } from "../libs";

export const deserialize = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const refreshToken: string | undefined = req.headers["x-refresh-token"] as
    | string
    | undefined;

  // NO ACCESS TOKEN
  if (!accessToken) {
    return next();
  }

  // ACCESS TOKEN
  const { decoded, expired, valid } = verifyJwt(accessToken);
  
  // ACCESS TOKEN IS VALID
  if (!!decoded && valid) {
    res.locals.user = decoded;
    return next();
  }

  // ACCESS TOKEN IS EXPIRED
  if (expired) {
    // NO REFRESH TOKEN
    if (!refreshToken) {
      return next();
    }

    // REFRESH TOKEN
    const {
      decoded: rDecoded,
      expired: rExpired,
      valid: rValid,
    } = verifyJwt(refreshToken);

    // REFRESH TOKEN IS NOT VALID OR EXPIRED
    if (!rDecoded || rExpired || !rValid) {
      return next();
    }

    // REFRESH TOKEN IS VALID AND ASSIGN NEW TOKEN
    const newAccessToken = signJwt(
      omit(rDecoded as Object, ["exp", "iat"]) as Object, // REMOVE exp and iat PROPERTY
      {
        expiresIn: config.get<string>(DefaultConfig.ACCESS_TOKEN_TTL),
      }
    );

    // NEW HEADER WITH NEW ACCESS TOKEN
    res.setHeader("x-access-token", newAccessToken);
    res.locals.user = omit(rDecoded as Object, ["exp", "iat"]);
    return next();
  }

  return next();
};
