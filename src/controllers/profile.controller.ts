import { Request, Response } from "express";
import { findUserById } from "../services/user.store";

export const getProfile = (
    req: Request,
    res: Response
): void => {

    // Get authenticated user ID from middleware
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }

    // Find user in memory
    const user = findUserById(userId);

    if (!user) {
        res.status(404).json({
            message: "User not found"
        });
        return;
    }

    // Return basic user information
    res.status(200).json({
        message: "Profile retrieved successfully",
        user: {
            id: user.id,
            email: user.email
        }
    });
};