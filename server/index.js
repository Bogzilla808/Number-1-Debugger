import express from "express";
import { db } from "./config.js";
import authRoutes from "./routes/authRoutes.js"
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// register routes
app.use("/auth", authRoutes);

// create tables automatically
try {
    await db.sync({force: true}); // creates tables in database.sqlite
    console.log("Database synced successfully!");
} catch (err) {
    console.error("DB sync error:", err);
}

app.listen(3001, () => console.log("Server running on http://localhost:3001"));