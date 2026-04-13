import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL, {
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: true,
    minPoolSize: 1,
    maxPoolSize: 10
});

export async function connectDB() {
    try {
        if (client.topology && client.topology.isConnected()) {
            return client;
        }
        await client.connect();
        console.log("✅ MongoDB Connected");
        return client;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
}

// Still call it locally to start connecting
connectDB().catch(() => { });

export { client };
