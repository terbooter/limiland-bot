import {UserData} from "./UserData"
import {TG_User} from "./TG"
import {Config} from "./Config"
import {LContext} from "./server"
import {Game} from "./Game"
import {DB} from "./DB"
import {r100} from "./functions"
import {Rand} from "./Rand"

export class User {
    static all: {[uid: number]: UserData} = {}

    static N = 1

    static createNew(from: TG_User): UserData {
        let u: UserData = {
            rand: {main: 0},
            ap: 0,
            dexterity: 0,
            intellect: 0,
            vitality: 0,
            uid: from.id,
            // short_uid: uid2shortUid(ctx.uid),
            short_uid: User.N++ + "",
            first_name: from.first_name,
            last_name: from.last_name,
            username: from.username,
            hp: Config.INTRO_MAX_HP,
            strength: Config.INTRO_STRENGTH,

            chips: Config.INTRO_CHIPS,
            losable_chips: 0,
            limi: Config.INTRO_LIMI,
            place: {
                name: "intro",
                step: 0
            }
        }

        return u
    }

    static async load() {
        await User.loadAllUsers()
    }

    static async loadAllUsers(): Promise<void> {
        const sql = `SELECT *
                     FROM users
                     order by created_at`
        let r = await DB.query(sql)

        for (let row of r.rows) {
            let u: UserData = row.data
            u = User.injectNewParams(u)
            // console.log(`${u.uid} ${u.first_name} ${User.getPower(u)}`)

            User.all[row.uid] = u
        }
    }

    static injectNewParams(u: UserData) {
        return u
    }

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (t === "/refresh") {
            await Game.draw(u)
            return true
        }

        return false
    }

    static getMaxAP(u: UserData): number {
        return u.dexterity * 1
    }

    static getMaxHP(u: UserData): number {
        return u.vitality * 5
    }

    static getDamage(u: UserData): number {
        return u.strength
    }

    static getArmor(u: UserData): number {
        return Math.floor(u.vitality / 10)
    }

    static getName(u: UserData): string {
        return u.first_name
    }

    static nextRand(name: keyof UserData["rand"], u: UserData): string {
        if (r100(1)) {
            console.log(`Skip moving rand: ${name}`)
        }

        u.rand[name]++
        if (u.rand[name] >= Rand[name].length) {
            u.rand[name] = 0
        }

        return Rand[name][u.rand[name]]
    }
}
