import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
    userId: string;
}

// iat = issued at
// exp = expired at
// both are unix time stamps
// subtracting them will give the seconds difference
// which is amount of time it expires in
export const generateAccessToken = (userId: string): string => {

    return jwt.sign(
        { userId },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
            algorithm: "HS256"
        }
    );
};

export const generateRefreshToken = (userId: string): string => {

    return jwt.sign(
        { userId },
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
            algorithm: "HS256"
        }
    );
};

export const verifyAccessToken = (token: string): TokenPayload => {

    return jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
        {
            algorithms: ["HS256"]
        }
    ) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {

    return jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET,
        {
            algorithms: ["HS256"]
        }
    ) as TokenPayload;
};

export const getTokenExpiry = (token: string): number => {
  const decoded = jwt.decode(token);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.exp !== "number"
  ) {
    throw new Error("INVALID_TOKEN_EXPIRY");
  }

  return decoded.exp * 1000;
};