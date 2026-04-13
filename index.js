import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import authRouter from "./routes/routes.routes.js"
import ticketRouter from "./routes/ticket.routes.js"
import { client, connectDB } from "./config/db.js"
import { initEmailListener } from "./services/imap.service.js"
import { dbMiddleware } from "./middleware/db.middleware.js"

const app = express()
app.use(express.json());
app.use(cors());
app.use(dbMiddleware); // Ensure DB is connected for every request
const PORT = process.env.PORT || 4000

// Initialize IMAP Listener after DB connects
connectDB()
  .then((client) => {
    const db = client.db("Skillnest");
    initEmailListener(db);
  })
  .catch(err => {
    console.error("Initial DB connection failed:", err.message);
  });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/auth", authRouter);
app.use("/tickets", ticketRouter);

// Standard export for Vercel
export default app;

// Only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}