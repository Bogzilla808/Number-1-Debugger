import { db } from "../config.js";
import { DataTypes } from "sequelize";

export const ProjectTesters = db.define("ProjectTesters", {}, { timestamps: false });

