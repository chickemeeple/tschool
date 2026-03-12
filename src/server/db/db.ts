import { Sequelize } from "sequelize";
import sequelize from "./sequelize";

export default class Db {
    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize
    }
}