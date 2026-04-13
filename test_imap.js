import { syncEmails } from "./services/imap.service.js";
import { client, connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
    console.log("🚀 Starting IMAP Sync Test...");

    try {
        await connectDB();
        const db = client.db("TicketNest"); // Use the correct DB name from your config

        console.log("📊 Connected to DB. Starting sync...");
        const result = await syncEmails(db);

        console.log("✅ Sync Result:", result);

        if (result.success) {
            console.log(`🎉 Processed ${result.processedCount} emails.`);
        }
    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

runTest();
