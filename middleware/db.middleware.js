import { connectDB } from "../config/db.js";

export const dbMiddleware = async (req, res, next) => {
    try {
        const client = await connectDB();
        const db = client.db("Skillnest");

        // Attach to both req for current request and app.locals for global availability
        req.db = db;
        req.app.locals.db = db;

        next();
    } catch (error) {
        console.error("Database Middleware Error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
};
