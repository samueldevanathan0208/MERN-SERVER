import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
import authRouter from "./routes/routes.routes.js"
import ticketRouter from "./routes/ticket.routes.js"
import { client } from "./config/db.js"
import { initEmailListener } from "./services/imap.service.js"

const app = express()
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 4000

const db = client.db("Skillnest");
app.locals.db = db;

// Initialize IMAP Listener
initEmailListener(db);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/auth", authRouter)
app.use("/tickets", ticketRouter)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

export { client }