export const createTicketService = async (db, ticketData) => {
    const { subject, description, customerEmail, priority, category } = ticketData;

    const ticket = {
        subject,
        description,
        customerEmail,
        priority,
        category,
        status: "Open",
        assignedTo: null,
        messages: description,
        createdAt: new Date(),
    };

    const result = await db.collection("tickets").insertOne(ticket);

    return {
        ...ticket,
        _id: result.insertedId,
    };
};

export const getTicketsService = async (db, filters = {}) => {
    return await db.collection("tickets").find(filters).sort({ createdAt: -1 }).toArray();
};

import { ObjectId } from "mongodb";

export const getTicketByIdService = async (db, ticketId) => {
    return await db.collection("tickets").findOne({ _id: new ObjectId(ticketId) });
};

/**
 * Updates a ticket in the database.
 */
export const updateTicketService = async (db, ticketId, updates) => {
    return await db.collection("tickets").updateOne(
        { _id: new ObjectId(ticketId) },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }
    );
};

/**
 * Gets ticket statistics for an agent.
 */
export const getTicketStatsService = async (db, agentName) => {
    const query = agentName ? { assignedTo: agentName } : {};
    const tickets = await db.collection("tickets").find(query).toArray();

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        assigned: tickets.filter(t => t.status === 'Assigned').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
    };

    return stats;
};

/**
 * Aggregates unique customers from the tickets collection.
 */
export const getCustomersService = async (db) => {
    return await db.collection("tickets").aggregate([
        {
            $group: {
                _id: "$customerEmail",
                email: { $first: "$customerEmail" },
                createdAt: { $min: "$createdAt" },
                ticketCount: { $sum: 1 },
                latestStatus: { $first: "$status" }
            }
        },
        {
            $project: {
                _id: 0,
                email: 1,
                createdAt: 1,
                status: { $cond: { if: { $gt: ["$ticketCount", 0] }, then: "Active", else: "Inactive" } },
                name: { $arrayElemAt: [{ $split: ["$email", "@"] }, 0] }
            }
        },
        { $sort: { createdAt: -1 } }
    ]).toArray();
};
