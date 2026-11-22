import bcrypt from "bcrypt";
import {
    findUserByEmail,
    saveUser
} from "./user.store";

import {
  findRefreshToken,
  deleteRefreshToken,
  saveRefreshToken
} from "./refresh-token.store";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry
} from "../utils/token";

export const logoutUser = (refreshToken: string): void => {
  try {
    // Verify that the refresh token is valid
    verifyRefreshToken(refreshToken);

    // Invalidate it in the token store
    deleteRefreshToken(refreshToken);
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }
};

import { findUserById } from "./user.store";

import { randomUUID } from "crypto";

import { User } from "../types";

// async api call for server authentication
export const registerUser = async (
    email: string,
    password: string
): Promise<User> => {

    // Check if user already exists
    const existingUser = findUserByEmail(email);

    if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS");
    }

    // Hash password - using bcrypt to hash the password
    // 12 - cost factor - A higher cost increases the computational effort 
    // required to hash a password and verify it.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser: User = {
        id: randomUUID(),
        email,
        password: hashedPassword
    };

    // Save user
    saveUser(newUser);

    return newUser;
};

// login user for api authentication
export const loginUser = async (
    email: string,
    password: string
) => {

    // Find user
    const user = findUserByEmail(email);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // Compare supplied password with stored bcrypt hash
    // bcrypt compares the supplied password against the stored hash.
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store hashed refresh token
    saveRefreshToken(
        refreshToken,
        user.id,
        getTokenExpiry(refreshToken)
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email
        }
    };
};


// refresh token function
// extract the incoming token, validate its signature and database state, 
// issue a fresh access token, and handle failures with strict status codes.
export const refreshUserTokens = (refreshToken: string) => {
  try {
    // 1. Verify the refresh JWT
    const decoded =  verifyRefreshToken(refreshToken);

    // 2. Check whether the token exists in our store
    const storedToken = findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // 3. Check expiry and ownership
    if (
      storedToken.expiresAt <= Date.now() ||
      storedToken.userId !== decoded.userId
    ) {
      deleteRefreshToken(refreshToken);
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // 4. Check that the user still exists
    const user = findUserById(decoded.userId);

    if (!user) {
      deleteRefreshToken(refreshToken);
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // 5. Generate a new token pair
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // 6. Rotate refresh tokens
    deleteRefreshToken(refreshToken);
    
    saveRefreshToken(newRefreshToken, user.id, getTokenExpiry(newRefreshToken));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email
      }
    };

  } catch (err: any) {
    throw new Error(`INVALID_REFRESH_TOKEN${err && err.message ? `: ${err.message}` : ""}`);

    // throw new Error("INVALID_REFRESH_TOKEN");
  }

};