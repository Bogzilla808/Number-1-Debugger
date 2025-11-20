import { db } from "../config.js";
import { DataTypes  } from "sequelize";

export const ProjectTeamMembers = db.define("ProjectTeamMembers", {}, { timestamps: false });
