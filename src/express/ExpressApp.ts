import {Application, Handler, Request} from "express"
import express = require("express")
import {MainRouter} from "./MainRouter"
import * as bodyParser from "body-parser"
import morgan = require("morgan")
import chalk = require("chalk")
import {JWTHelper} from "./JWTHelper"
import {logDate} from "../functions"

export class ExpressApp {
    private app: Application = express()

    constructor() {
        console.log(`ExpressApp start...`)
        this.app
            // .use(morgan("dev"))
            .use(this.getMorganMiddleware())
            .use(express.static("public"))
            .use(express.static("data"))
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({extended: false}))
            .use(this.setHeaders.bind(this))
            .use(this.optionsMiddleware.bind(this))
            .use("/", new MainRouter().router)
        // .use(this.middleware404)
        // .use(this.finalMiddleware)
    }

    private setHeaders(req, res: express.Response, next) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE, OPTIONS")
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, client_id"
        )

        next()
    }

    private async optionsMiddleware(req, res, next) {
        if (req.method !== "OPTIONS") {
            next()
            return
        }

        res.statusCode = 200
        res.end("OK")
    }

    private getMorganMiddleware(): Handler {
        return morgan(function (tokens, req, res) {
            return (
                `${logDate()} ` +
                chalk.blue(tokens.method(req, res)) +
                " " +
                chalk.green(tokens.url(req, res)) +
                " " +
                chalk.red(tokens["response-time"](req, res)) +
                " " +
                tokens["status"](req, res)
            )
        })
    }

    public getApp(): Application {
        return this.app
    }

    public static async checkToken(req: Request<any>, res, next) {
        const authorizationHeader = req.get("authorization")

        if (!authorizationHeader) {
            res.json({success: false, errors: [{message: "authorization header missing"}]})
            return
        }
        const token = authorizationHeader.split(" ")[1]

        try {
            const r: any = await JWTHelper.verify(token, "access")
            req.user = {
                userId: r.sub,
                username: r.username
            }
            next()
        } catch (err) {
            res.json({ok: false, errors: err})
        }
    }
}

// https://blog.logrocket.com/extend-express-request-object-typescript/
// Hack to inject custom params to native Request type
declare global {
    namespace Express {
        export interface Request {
            language?: "en" | "ru"
            user?: {userId: number; username: string}
        }
    }
}
