import { Request, Response } from "express";
import { z } from "zod";

import { registerUser } from "../services/auth.service";
import { loginUser } from "../services/auth.service";
import { logoutUser } from "../services/auth.service";
import { refreshUserTokens } from "../services/auth.service";

// Request validation schema
const registerSchema = z.object({
    email: z.string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

// POST /auth/register
export const register = async (
    req: Request,
    res: Response
): Promise<void> => {

    // Validate request body
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validation.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
        return;
    }

    const { email, password } = validation.data;

    try {
        const user = await registerUser(email, password);

        // Never return the password hash
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {

        if (
            error instanceof Error &&
            error.message === "USER_ALREADY_EXISTS"
        ) {
            res.status(409).json({
                message: "User already exists"
            });
            return;
        }

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Login validation schema
const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z.string()
        .min(1, "Password is required")
});

// POST /auth/login
export const login = async (
    req: Request,
    res: Response
): Promise<void> => {

    // Validate request
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validation.error.issues
        });
        return;
    }

    const { email, password } = validation.data;

    try {

        const result = await loginUser(email, password);

        res.status(200).json({
            message: "Login successful",
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            tokenType: "Bearer",
            user: result.user
        });

    } catch (error) {

        if (
            error instanceof Error &&
            error.message === "INVALID_CREDENTIALS"
        ) {
            res.status(401).json({
                message: "Invalid email or password"
            });
            return;
        }

        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// POST /auth/refresh
export const refresh = (req: Request, res: Response): void => {
  const schema = z.object({
    refreshToken: z.string().min(1)
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Refresh token is required"
    });
    return;
  }

  try {
    const tokens = refreshUserTokens(result.data.refreshToken);

    res.status(200).json({
      message: "Tokens refreshed successfully",
      tokenType: "Bearer",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
    
  } catch {
    res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }
};

// POST auth/logout
export const logout = (req: Request, res: Response): void => {
  const schema = z.object({
    refreshToken: z.string().min(1)
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Refresh token is required"
    });
    return;
  }

  try {
    logoutUser(result.data.refreshToken);

    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch {
    res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }
};