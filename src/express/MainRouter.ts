import * as express from "express"
import {Router} from "express"
import {JWTHelper, JwtPayload} from "./JWTHelper"
import {Auth, WebAppInitData} from "./Auth"

export class MainRouter {
    public readonly router: Router

    constructor() {
        this.router = express.Router()

        this.router
            .post("/api/users/create", this.create.bind(this))
            .post("/api/users/refresh-token", this.refreshToken.bind(this))

            .get("/api/users/debugt", this.debugTable.bind(this))
            .get("/api/users/debugt/:room_id/:table_id", this.debugTableById.bind(this))
            .use("/limiland/yoomoney_test", this.payment_callback.bind(this))
    }

    private async payment_callback(req, res) {
        const o = req.body

        console.log(o)

        try {
            res.end("ok")
        } catch (err) {
            // @ts-ignore
            let message = err.message
            console.log(err)
            res.end(message)
        }
    }

    private async create(req, res, next) {
        const body = req.body

        if (!body.initData) {
            res.json({ok: false, error: "initData required parameter"})
            return
        }

        try {
            const init: WebAppInitData = Auth.check(body.initData)
            const telegram_id = init.user.id
            let username = init.user.first_name
            let referral_id: number | null = null

            if (init.user.last_name) {
                username += " " + init.user.last_name
            }

            if (init.start_param) {
                referral_id = parseInt(init.start_param)
            }

            let type: string | undefined
            let avatar_url: string | undefined

            let botUser = init.user

            res.json({test: 1})
            return
        } catch (error) {
            console.log(error)
            res.json({ok: false, error: error})
            return
        }
    }

    private async refreshToken(req, res, next) {
        const refreshToken = req.body.refreshToken

        if (!refreshToken) {
            res.json({ok: false, error: "refreshToken required"})
            return
        }

        try {
            const decoded: JwtPayload = await JWTHelper.verify(refreshToken, "refresh")

            const newAccessToken = JWTHelper.sign(decoded, "access")
            const newRefreshToken = JWTHelper.sign(decoded, "refresh")

            res.json({
                ok: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        } catch (err) {
            res.json({ok: false, error: err})
        }
    }

    private async debugTable(req, res, next) {
        res.json(1)
    }

    private async debugTableById(req, res, next) {
        res.json({room_id: 1, table_id: 2})
    }
}
