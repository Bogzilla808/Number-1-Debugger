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
    description: DataTypes.TEXT
}, { timestamps: false });