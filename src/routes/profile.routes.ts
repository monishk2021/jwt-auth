import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware";
import { getProfile } from "../controllers/profile.controller";

const router = Router();

// Protected profile endpoint
router.get("/", authenticateToken, getProfile);

export default router;