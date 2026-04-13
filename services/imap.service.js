import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { analyzeEmail } from "./ai.service.js";
import { createTicketService } from "./ticket.service.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initializes the IMAP listener.
 * @param {object} db - MongoDB database instance
 */
export const initEmailListener = async (db) => {
    const client = new ImapFlow({
        host: process.env.IMAP_HOST || "imap.gmail.com",
        port: parseInt(process.env.IMAP_PORT) || 993,
        secure: true,
        auth: {
            user: process.env.IMAP_USER,
            pass: process.env.IMAP_PASSWORD,
        },
        logger: false,
    });

    // Handle unexpected connection errors
    client.on("error", (err) => {
        console.error("⚠️ IMAP Connection Error:", err.message);
        // Let the catch block or a timeout handle reconnection if needed
    });

    try {
        // console.log(`Connecting to IMAP: ${process.env.IMAP_USER}...`);
        await client.connect();

        // Select the INBOX
        const mailbox = await client.mailboxOpen("INBOX");
        console.log(`✅ IMAP Connected. Mailbox 'INBOX' opened. Total messages: ${mailbox.exists}`);

        // Handle new messages
        client.on("exists", async (data) => {
            try {
                const count = data.count;
                // console.log(`New email detected! Total messages: ${count}`);

                const message = await client.fetchOne(count, { source: true });
                if (!message) return;

                const parsed = await simpleParser(message.source);

                const emailData = {
                    subject: parsed.subject || "No Subject",
                    from: parsed.from?.value[0]?.address || "unknown@example.com",
                    body: parsed.text || parsed.html || "No Body",
                };

                // console.log(`Processing email from ${emailData.from}: ${emailData.subject}`);

                // 1. AI Analysis
                const { priority } = await analyzeEmail(emailData.body);

                // 2. Create Ticket
                const ticketData = {
                    subject: emailData.subject,
                    description: emailData.body,
                    customerEmail: emailData.from,
                    priority,
                };

                // Check if DB is still connected
                if (db) {
                    const newTicket = await createTicketService(db, ticketData);
                    // console.log(`Ticket created: ${newTicket._id} [Priority: ${priority}, Category: ${category}]`);
                } else {
                    console.error("❌ Database connection not available for ticket creation.");
                }
            } catch (err) {
                console.error("Error processing email event:", err.message);
            }
        });

    } catch (error) {
        console.error("❌ IMAP Connection Error:", error.message);

        // Ensure cleanup on failure
        try { await client.logout(); } catch (e) { }

        console.log("Retrying IMAP connection in 30 seconds...");
        setTimeout(() => initEmailListener(db), 30000);
    }
};
