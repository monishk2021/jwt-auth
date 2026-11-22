import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Access token required"
        });
        return;
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {

        // Verify token signature and expiry
        const decoded = verifyAccessToken(token);

        // Attach authenticated user to request
        req.user = {
            userId: decoded.userId
        };

        // Continue to controller
        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired access token"
        });

        return;
    }
};