import { db } from "../config.js";
import { DataTypes } from "sequelize";

export const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: { isEmail: true}
    },
    password_hash: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    role: {
        type: DataTypes.ENUM("pm", "tst"),
        allowNull: false
    }
},
{
    timestamps: false
});
