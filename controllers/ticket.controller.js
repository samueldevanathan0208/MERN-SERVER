import { createTicketService, getTicketsService, updateTicketService, getTicketStatsService, getCustomersService, getTicketByIdService } from "../services/ticket.service.js";
import { sendResolutionEmail } from "../services/email.service.js";
import { analyzeEmail } from "../services/ai.service.js";
import { syncEmails } from "../services/imap.service.js";
import { connectDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// Triggers manual sync of emails to tickets
export const syncTickets = async (req, res) => {
    try {
        const db = req.db;
        await syncEmails(db);
        res.json({ message: "Emails synced successfully" });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: "Failed to sync emails", details: error.message });
    }
};


// Handles the POST /tickets/email request to convert an email to a ticket.
export const createTicketFromEmail = async (req, res) => {
    try {
        const { subject, from, body } = req.body;

        if (!subject || !from || !body) {
            return res.status(400).json({ error: "Missing required fields: subject, from, body" });
        }

        // Step 1: AI Analysis
        console.log(`Analyzing email from ${from}: ${subject}`);
        const { priority } = await analyzeEmail(body);

        // Step 2: Create Ticket in DB
        const db = req.db;
        const ticketData = {
            subject,
            description: body,
            customerEmail: from,
            priority,
            category,
        };

        const newTicket = await createTicketService(db, ticketData);

        console.log(`Ticket created: ${newTicket._id} with priority ${priority}`);

        return res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket,
        });
    } catch (error) {
        console.error("Error creating ticket from email:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Handles the GET /tickets request to retrieve all tickets.
export const getTickets = async (req, res) => {
    try {
        const db = req.db;
        const { agent } = req.query;
        const filters = agent ? { assignedTo: agent } : {};

        const tickets = await getTicketsService(db, filters);
        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
// Handles PATCH /tickets/:id
export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const db = req.db;

        // If status is being updated to Resolved, trigger email notification
        if (updates.status === 'Resolved') {
            const ticket = await getTicketByIdService(db, id);
            if (ticket && ticket.customerEmail) {
                await sendResolutionEmail(ticket.customerEmail, ticket.subject);
            }
        }

        await updateTicketService(db, id, updates);
        res.json({ message: "Ticket updated successfully" });
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Handles GET /tickets/stats
export const getTicketStats = async (req, res) => {
    try {
        const { agent } = req.query;
        const db = req.db;
        const stats = await getTicketStatsService(db, agent);
        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//   Handles GET /tickets/customers

export const getCustomers = async (req, res) => {
    try {
        const db = req.db;
        const customers = await getCustomersService(db);
        res.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
