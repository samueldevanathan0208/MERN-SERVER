import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
import authRouter from "./routes/routes.routes.js"
import ticketRouter from "./routes/ticket.routes.js"
import { connectDB, dbMiddleware } from "./config/db.js"
import { initEmailListener } from "./services/imap.service.js"

const app = express()
app.use(express.json());
app.use(cors());
app.use(dbMiddleware); // Ensure DB is connected for every request
const PORT = process.env.PORT || 4000

// Initialize IMAP Listener after DB connects
connectDB().then((client) => {
  const db = client.db("Skillnest");
  initEmailListener(db);
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/auth", authRouter)
app.use("/tickets", ticketRouter)

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })
}

export default app;
export { client }