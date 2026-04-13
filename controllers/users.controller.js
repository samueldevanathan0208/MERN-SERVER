import {
    createUserService,
    loginUserService,
    getAgentsService,
    getTopAgentsService
} from "../services/users.service.js";

export const createUser = async (req, res) => {
    try {
        const result = await createUserService(req.db, req.body);
        res.json(result);
    } catch (err) {
        console.error("Create User Error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const result = await loginUserService(req.db, req.body);
        res.json(result);
    } catch (err) {
        console.error("Login Error:", err);
        res.status(400).json({ message: err.message });
    }
};
export const getAgents = async (req, res) => {
    try {
        const db = req.db;
        const agents = await getAgentsService(db);
        res.json(agents);
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTopAgents = async (req, res) => {
    try {
        const db = req.db;
        const agents = await getTopAgentsService(db);
        res.json(agents);
    } catch (error) {
        console.error("Error fetching top agents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
