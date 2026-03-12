import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import bodyParser from "body-parser";
import dns from "dns";
import uws from "uWebSockets.js"
import jwt, { JwtPayload } from "jsonwebtoken"

import config from "./config.json"
import path from "path";
import SocketUtil from "./socket_util";
import Db from "./db/db";

import type {UserData} from "./socket_util"
import { User } from "./db/user";

interface JWT extends JwtPayload {
    uid:string
    iat: number
    exp: number
}

class Server {
    env!: "development" | "production"
    developmentServer: http.Server|undefined
    debugMode!: boolean
    socketUtil!: SocketUtil;
    db!: Db
    jwtSecret!: string

    constructor() {
        this.db = new Db();
    }

    async run() {
        this.env = process.env.ENV === "production" ? "production" : "development";
        this.debugMode = this.env == "development";
        this.jwtSecret = process.env.JWT_SECRET!;

        if (this.debugMode) this.developmentServer = this.initDevelopmentServer();

        if(this.env != "development") {
            try {
                let dnsEntry = await dns.promises.lookup("google.com")
                if(!dnsEntry) console.log("DNS service not working. Cannot resolve google.com")
                return
            } catch (e) {
                console.log("DNS service not working. Cannot resolve google.com")
                return
            }
        }

        this.initWebsocketServer()
    }

    initWebsocketServer(): uws.TemplatedApp {
        this.socketUtil = new SocketUtil();

        let app;
        if(this.debugMode) app = uws.App()
        else app = uws.SSLApp({
            key_file_name: config.production.sslKeyFileName,
            cert_file_name: config.production.sslCertFileName
        })

        app.ws<UserData>("/*", {
            open: (ws) => {
                this.socketUtil.onSocketConnected(ws)
            },
            message: (ws, message, isBinary) => {
                if (isBinary) {
                    
                } else {
                    
                }
            },
            close: (ws, code, message) => {
                
            }
        })
        let socketPort = this.debugMode ? config.development.gamesocketPort : config.production.gamesocketPort
        app.listen(socketPort, (token) => {
            if(token) {
                console.log("Game socket listening on port " + socketPort)
                } else {
                throw new Error("Game socket failed to start.")
            }
        })

        return app;
    }

    initDevelopmentServer(): http.Server {
        const app = express()
        app.use(cors())
        app.use(bodyParser.json())
        app.use(morgan("dev"))
        app.use(express.static(path.join(__dirname, "../../dist/")))
        
        app.get("/", (req, res): void => {
            res.sendFile(path.join(__dirname,"../../dist/client/html/index.html"))
        })       

        app.post("/login", async (req, res) => {
            //send token to be stored in localstorage if valid
            let username:string = req.body.username
            let password:string = req.body.password
        
            let isLoggedIn:boolean = await User.isUserLoggedIn(username, password);

            if(!isLoggedIn) {
                res.send({error: true, message: "Invalid credentials."})
                return;
            }

            let userdata = await User.findOne({where: {username: username}});

            let uid = userdata!.uid
            let token = this.generateJwt(uid);

            res.send({error: false, token: token})
        })

        app.post("/create_account", async (req, res) => {
            let createdUser = await User.createOne(req.body);

            if(createdUser.error) {
                res.send(createdUser);
                return
            }

            res.send({error: false, message: "Success"})
        })

        app.post("/verify_token", async (req, res) => {
            if(!req.body.token) {
                res.send({error: true, message: "token not found"})
                return
            }

            let jwtData = this.verifyJwt(req.body.token) as JWT
            if(!jwtData) {
                res.send({error: true, message: "Token invalid. Try logging in again."})
                return
            }

            let user = await User.findOne({where: {uid: jwtData.uid}})

            res.send({error: false, data: {username: user?.username, uid: user?.uid, email: user?.email}})
        })

        const devAppServerPort = config.development.serverPort
        let developmentServer = new http.Server(app)
        
        developmentServer.listen(devAppServerPort)

        console.log("Server available at http://localhost:" + devAppServerPort);

        return developmentServer
    }
    
    verifyJwt(token: string):boolean|string|JwtPayload {
        let data;
        try {
            data = jwt.verify(token, this.jwtSecret)
        } catch(e) {
            return false
        }
        
        return data;
    }

    /**
     * Generates a jwt with uid, iat, and expires in one month.
     */
    generateJwt(uid: string):string {
        return jwt.sign({uid: uid}, this.jwtSecret, {expiresIn: 2628002 /* One month */})
    }
}


export default Server;