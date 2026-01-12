import { db } from "../config.js";
import { DataTypes } from "sequelize";

export const Bug = db.define("Bug", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: DataTypes.TEXT,
    severity: {
        type: DataTypes.ENUM("LOW", "MED", "HIGH", "CRITICAL"),
        defaultValue: "LOW"
    },
    status: {
        type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"),
        defaultValue: "OPEN"
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: { min: 1, max: 5 }
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reporter_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: false });