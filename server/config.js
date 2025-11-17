import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

// export const db = new Sequelize(
//     "no1DebuggerDB", // db name
//     "root", // username
//     "password", // password
//     {
//         host: "localhost",
//         dialect: "mysql",
//         logging: false
//     }
// );

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"), // database file
  // logging: false, // optional, hides SQL logs
});