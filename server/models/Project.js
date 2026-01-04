import { db } from "../config.js";
import { DataTypes } from "sequelize";

// projects (id PK, name, description, repo_url, created_by_user_id FK, created_at,
//     teamMembers[]  // array of user IDs
//     testers: [],
//     bugs: [] );
export const Project = db.define("Project", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    repo_url: {
        type: DataTypes.STRING, 
        allowNull: true,
        validate: {isUrl: true}
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id"
        }
    }
}, {timestamps: false});
