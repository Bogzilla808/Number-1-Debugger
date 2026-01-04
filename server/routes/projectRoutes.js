import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { Project } from "../models/Project.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const {userId} = req.query;
        if(!userId) {
            return res.status(400).json({error: "userId is required"});
        }

        const projects = await Project.findAll({
            where: {
                created_by_user_id: Number(userId)
            }
        });

        res.json(projects);
    } catch (err) {
        console.error("Fetch projects error: ", err);
        res.status(500).json({error: err.message});
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, description, repo_url, created_by_user_id } = req.body;
        
        if (!name || !created_by_user_id) {
            return res.status(400).json({ error: "Name and creator ID are required" });
        }

        const project = await Project.create({
            name,
            description,
            repo_url,
            created_by_user_id
        });
        
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;