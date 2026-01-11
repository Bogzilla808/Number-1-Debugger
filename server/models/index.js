import { User } from "./User.js";
import { Project } from "./Project.js";
import { Bug } from "./Bug.js";
import { ProjectTeamMembers } from "./ProjectTeamMembers.js";
import { ProjectTesters } from "./ProjectTesters.js";

// --- Creator: One-to-Many ---
User.hasMany(Project, { foreignKey: "created_by_user_id" });
Project.belongsTo(User, { foreignKey: "created_by_user_id" });

// --- Team Members: Many-to-Many ---
User.belongsToMany(Project, {
    through: ProjectTeamMembers,
    as: "teamProjects",
    foreignKey: "user_id"
});
Project.belongsToMany(User, {
    through: ProjectTeamMembers,
    as: "teamMembers",
    foreignKey: "project_id"
});

// --- Testers: Many-to-Many ---
User.belongsToMany(Project, {
    through: ProjectTesters,
    as: "testingProjects",
    foreignKey: "user_id"
});
Project.belongsToMany(User, {
    through: ProjectTesters,
    as: "testers",
    foreignKey: "project_id"
});

// --- Bugs: One-to-Many ---
Project.hasMany(Bug, { foreignKey: "project_id" , onDelete: "CASCADE"});
Bug.belongsTo(Project, { foreignKey: "project_id" });
User.hasMany(Bug, { foreignKey: "reporter_id" });
Bug.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });

export {
    User,
    Project,
    Bug,
    ProjectTeamMembers,
    ProjectTesters
};
