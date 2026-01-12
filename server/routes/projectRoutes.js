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

// Update bug status (only for bugs belonging to the project)
router.patch("/:id/bugs/:bugId/status", async (req, res) => {
  try {
    const { status, userId } = req.body;
    const allowed = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }

    const bug = await Bug.findOne({ where: { id: req.params.bugId, project_id: req.params.id } });
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    // If moving to IN_PROGRESS, set assigned_to to userId
    if (status === "IN_PROGRESS") {
      await bug.update({ status, assigned_to: userId || null });
      return res.json(bug);
    }

    // If moving to RESOLVED, only allow if assigned_to matches userId
    if (status === "RESOLVED") {
      if (!bug.assigned_to || bug.assigned_to !== userId) {
        return res.status(403).json({ error: "Only the assigned member can mark this bug as resolved" });
      }
      await bug.update({ status });
      return res.json(bug);
    }

    // For other status changes, allow
    await bug.update({ status });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bug severity (only project members or testers)
router.patch("/:id/bugs/:bugId/severity", async (req, res) => {
  try {
    const { severity, userId } = req.body;
    const allowed = ["LOW", "MED", "HIGH", "CRITICAL", "MEDIUM", "MED"];
    if (!severity || !["LOW","MED","HIGH","CRITICAL","MEDIUM","MED"].includes(severity)) {
      return res.status(400).json({ error: "Invalid or missing severity" });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // verify user is either project creator, team member or tester
    const isCreator = userId && Number(userId) === project.created_by_user_id;
    const member = await ProjectTeamMembers.findOne({ where: { project_id: req.params.id, user_id: userId } });
    const tester = await ProjectTesters.findOne({ where: { project_id: req.params.id, user_id: userId } });
    if (!isCreator && !member && !tester) {
      return res.status(403).json({ error: "User not authorized to change severity" });
    }

    const bug = await Bug.findOne({ where: { id: req.params.bugId, project_id: req.params.id } });
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    await bug.update({ severity });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bug priority (1-5) - allowed for creator, team members, testers
router.patch("/:id/bugs/:bugId/priority", async (req, res) => {
  try {
    const { priority, userId } = req.body;
    const p = Number(priority);
    if (!p || p < 1 || p > 5) return res.status(400).json({ error: "Invalid priority (1-5)" });

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isCreator = userId && Number(userId) === project.created_by_user_id;
    const member = await ProjectTeamMembers.findOne({ where: { project_id: req.params.id, user_id: userId } });
    const tester = await ProjectTesters.findOne({ where: { project_id: req.params.id, user_id: userId } });
    if (!isCreator && !member && !tester) {
      return res.status(403).json({ error: "User not authorized to change priority" });
    }

    const bug = await Bug.findOne({ where: { id: req.params.bugId, project_id: req.params.id } });
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    await bug.update({ priority: p });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;