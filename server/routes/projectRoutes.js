import express from "express";
import { Op } from "sequelize";
import { registerUser, loginUser } from "../controllers/authController.js";
import { Project } from "../models/Project.js";
import { Bug } from "../models/Bug.js";
import { User, ProjectTeamMembers, ProjectTesters } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const {userId} = req.query;
        if(!userId) {
            return res.status(400).json({error: "userId is required"});
        }

        // Find projects where user is creator, member, or tester
        const memberProjects = await ProjectTeamMembers.findAll({ where: { user_id: userId }, attributes: ['project_id'] });
        const testerProjects = await ProjectTesters.findAll({ where: { user_id: userId }, attributes: ['project_id'] });
        
        const projectIds = new Set();
        memberProjects.forEach(p => projectIds.add(p.project_id));
        testerProjects.forEach(p => projectIds.add(p.project_id));

        const projects = await Project.findAll({
            where: {
                [Op.or]: [
                    { created_by_user_id: Number(userId) },
                    { id: Array.from(projectIds) }
                ]
            },
            // Include testers to check permissions on frontend
            include: [{ model: User, as: 'testers', attributes: ['id'] }]
        });

        res.json(projects);
    } catch (err) {
        console.error("Fetch projects error: ", err);
        res.status(500).json({error: err.message});
    }
});

router.get("/search-users", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const users = await User.findAll({
            where: {
                name: { [Op.like]: `%${q}%` }
            },
            attributes: ['id', 'name', 'email', 'role']
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, description, repo_url, created_by_user_id, teamMemberIds, testerIds } = req.body;
        
        if (!name || !created_by_user_id) {
            return res.status(400).json({ error: "Name and creator ID are required" });
        }

        const project = await Project.create({
            name,
            description,
            repo_url,
            created_by_user_id
        });

        if (teamMemberIds && teamMemberIds.length > 0) {
            await project.setTeamMembers(teamMemberIds);
        }

        if (testerIds && testerIds.length > 0) {
            await project.setTesters(testerIds);
        }
        
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
        include: [
            { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email', 'role'] },
            { model: User, as: 'testers', attributes: ['id', 'name', 'email', 'role'] }
        ]
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { name, description, repo_url, teamMemberIds, testerIds } = req.body;
    
    await project.update({
      name,
      description,
      repo_url
    });

    if (teamMemberIds) await project.setTeamMembers(teamMemberIds);
    if (testerIds) await project.setTesters(testerIds);

    res.json(project);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    await project.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/bugs", async (req, res) => {
  try {
    const bug = await Bug.create({
      ...req.body,
      project_id: req.params.id
    });
    res.status(201).json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/bugs", async (req, res) => {
  try {
    const bugs = await Bug.findAll({ where: { project_id: req.params.id } });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;