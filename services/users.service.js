import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const createUserService = async (db, data) => {
    const { name, role } = data;
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date()
    });

    return { message: "User created", id: result.insertedId };
};

export const loginUserService = async (db, data) => {
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`DEBUG: Password match: ${isMatch}, Found user: ${user.email}, Input password length: ${password.length}`);
    if (!isMatch) {
        throw new Error("Invalid password");
    }

    const token = generateToken(user);

    return {
        message: "Login success",
        token,
        role: user.role,
        name: user.name
    };
};

export const getAgentsService = async (db) => {
    return await db.collection("users").find({ role: "agent" }).toArray();
};

export const getTopAgentsService = async (db) => {
    const pipeline = [
        { $match: { status: "Resolved", assignedTo: { $ne: null } } },
        { $group: { _id: "$assignedTo", resolvedCount: { $sum: 1 } } },
        { $sort: { resolvedCount: -1 } },
        { $limit: 5 }
    ];

    const results = await db.collection("tickets").aggregate(pipeline).toArray();

    // Enrich with agent info (optional, but good for initials)
    return results.map((r, index) => ({
        id: index + 1,
        name: r._id,
        resolved: r.resolvedCount,
        rank: index + 1,
        csat: 90 + Math.floor(Math.random() * 10) // Mocking CSAT for now
    }));
};
