import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client = null;
let clientPromise = null;

const options = {
    family: 4,
    tls: true,
    minPoolSize: 1,
    maxPoolSize: 10
};

if (!process.env.MONGO_URL) {
    throw new Error("Please add your Mongo URI to .env");
}

export async function connectDB() {
    if (clientPromise) {
        return clientPromise;
    }

    try {
        client = new MongoClient(process.env.MONGO_URL, options);
        clientPromise = client.connect().then((connectedClient) => {
            console.log("✅ MongoDB Connected");
            return connectedClient;
        }).catch((err) => {
            clientPromise = null; // Reset on failure
            throw err;
        });
        return clientPromise;
    } catch (err) {
        clientPromise = null;
        throw err;
    }
}

// Export the client directly for use in IMAP service (which runs outside req/res)
export { client };
