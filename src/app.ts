import express from "express";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";

const app = express();

app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "JWT Authentication API is running"
    });
});

// Authentication routes
app.use("/auth", authRoutes);

// Protected profile endpoint
app.use("/profile", profileRoutes);

export default app;