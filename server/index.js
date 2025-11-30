import express from "express";
import { db } from "./config.js";
import "./models/index.js";
import authRoutes from "./routes/authRoutes.js"
import cors from "cors";

const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());

// create tables automatically
try {
    await db.sync({force: true}); // creates tables in database.sqlite
    console.log("Database synced successfully!");
} catch (err) {
    console.error("DB sync error:", err);
}

// register routes
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log("Server running on http://localhost:3001"));