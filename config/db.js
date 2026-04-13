import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let clientPromise = null;

// Database connection helper
export async function connectDB() {
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL environment variable is missing!");
    }
    if (!clientPromise) {
        const client = new MongoClient(process.env.MONGO_URL, { family: 4, tls: true });
        clientPromise = client.connect();
    }
    return clientPromise;
}

// Simple Middleware to ensure connectivity
export const dbMiddleware = async (req, res, next) => {
    try {
        const client = await connectDB();
        req.db = client.db("Skillnest");
        req.app.locals.db = req.db;
        next();
    } catch (e) {
        res.status(500).json({ error: "DB connection failed" });
    }
};
