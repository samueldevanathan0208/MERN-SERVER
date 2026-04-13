import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { analyzeEmail } from "./ai.service.js";
import { createTicketService } from "./ticket.service.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Synchronizes unread emails and converts them to tickets.
 * @param {object} db - MongoDB database instance
 */
export const syncEmails = async (db) => {
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

    try {
        await client.connect();
        const lock = await client.getMailboxLock("INBOX");

        try {
            // Search for unseen messages
            const messages = await client.search({ unseen: true });
            console.log(`🔍 Found ${messages.length} unread emails.`);

            for (const uid of messages) {
                const message = await client.fetchOne(uid, { source: true });
                if (!message) continue;

                const parsed = await simpleParser(message.source);
                const emailData = {
                    subject: parsed.subject || "No Subject",
                    from: parsed.from?.value[0]?.address || "unknown@example.com",
                    body: parsed.text || parsed.html || "No Body",
                };

                // AI Analysis
                const { priority } = await analyzeEmail(emailData.body);

                // Create Ticket
                const ticketData = {
                    subject: emailData.subject,
                    description: emailData.body,
                    customerEmail: emailData.from,
                    priority,
                };

                if (db) {
                    await createTicketService(db, ticketData);
                    // Mark as seen
                    await client.messageFlagsAdd(uid, ["\\Seen"]);
                }
            }
        } finally {
            lock.release();
        }

        await client.logout();
        return { success: true, processed: 0 }; // messages.length could be tracked
    } catch (error) {
        console.error("❌ IMAP Sync Error:", error.message);
        try { await client.logout(); } catch (e) { }
        throw new Error(`IMAP Sync Failed: ${error.message}`);
    }
};

/**
 * Legacy initializer - no longer used on Vercel as background listeners are killed.
 */
export const initEmailListener = async (db) => {
    console.log("⚠️ initEmailListener is deprecated for Vercel. Use syncEmails instead.");
};

