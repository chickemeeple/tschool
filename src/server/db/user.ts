import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize";
import bcrypt from "bcrypt"
import Constants from "../constants.json"
import Config from "../config.json"
import isEmail from "validator/lib/isEmail";
import { isStrongPassword } from "validator";

interface createUserData {
    username: string
    email: string
    password: string
}

interface Errorable {
    error: boolean
    message: string
}

export class User extends Model {
    declare uid: string
    declare username: string
    declare hash: string
    declare email: string
    
    static async isUsernameTaken(username: string):Promise<boolean> {
        let user = await this.findOne({where: {username: username}})
        if(user) {
            return true;
        }
        return false;
    }

    static async isUserLoggedIn(username:string, plaintextPass:string):Promise<boolean> {
        let user = await this.findOne({where: {username: username}});
        if(!user) return false;

        const isLoggedIn = await bcrypt.compare(plaintextPass, user.hash)

        return isLoggedIn
    }

    static async validateUser(options: createUserData):Promise<Errorable> {
        if(!options.username || !options.password || !options.email) return {error: true, message: "Cannot have an empty field"};
        if(!isEmail(options.email)) return {error: true, message: "Email invalid"};
        if(!isStrongPassword(options.password, {minLength: 10, minSymbols: 0})) return {error: true, message: "Password is too weak."}

        if(await this.findOne({where: {username: options.username}})) return {error: true, message: "Username already exists"};

        return {error: false, message: "Success"}
    }

    static generateUid():string {
        let uid = '';
        for(let i = 0; i < Constants.playerUidChars; i++) {
            uid += Constants.playerUidValidChars[Math.floor(Math.random() * Constants.playerUidValidChars.length)]
        }
        return uid;
    }

    static async createOne(options: createUserData):Promise<Errorable> {
        let valid = await this.validateUser(options);
        if(valid.error) return valid;

        let uid = this.generateUid()
        let hash = await bcrypt.hash(options.password, 10)

        this.create({uid: uid, hash: hash, username: options.username, email: options.email});

        return {error:false, message:"Success"};
    }
}

User.init({
    uid: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    modelName: "User",
    tableName: "users",
    sequelize: sequelize
})