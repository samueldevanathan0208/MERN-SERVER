import { client, connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function checkDB() {
    try {
        await connectDB();
        const db = client.db("TicketNest");
        const tickets = await db.collection("tickets").find().sort({ createdAt: -1 }).limit(5).toArray();
        console.log("📂 Latest Tickets in DB:");
        console.table(tickets.map(t => ({
            id: t._id,
            subject: t.subject,
            priority: t.priority,
            category: t.category,
            customer: t.customerEmail,
            date: t.createdAt
        })));
    } catch (error) {
        console.error("❌ DB Check Failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

checkDB();
