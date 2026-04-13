import express from "express";
import { createTicketFromEmail, getTickets, updateTicket, getTicketStats, getCustomers } from "../controllers/ticket.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes below
router.use(authMiddleware);

/**
 * @route POST /tickets/email
 * @desc Create a ticket from an incoming email
 */
router.post("/email", createTicketFromEmail);

/**
 * @route GET /tickets
 * @desc Get all tickets
 */
router.get("/", getTickets);
router.get("/stats", getTicketStats);
router.get("/customers", getCustomers);
router.patch("/:id", updateTicket);

export default router;
