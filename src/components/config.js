import { Sequelize } from "sequelize";

export const db = new Sequelize({
    dialect: "sqlite",
    storage: "books.db" //name of database
});

export const syncDatabase = async () => {
    await db.authenticate();
    
    await db.sync();
}