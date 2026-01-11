import express from "express";
import { Bug } from "../models/Bug.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const bug = await Bug.create(req.body);
        res.status(201).json(bug);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { project_id } = req.query;
        const where = {};
        if (project_id) where.project_id = project_id;
        
        const bugs = await Bug.findAll({ where });
        res.json(bugs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
