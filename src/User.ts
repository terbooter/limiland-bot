import {UserData} from "./UserData"
import {send, TG_User} from "./TG"
import {Config} from "./Config"
import {LContext} from "./server"
import {Game} from "./Game"
import {DB} from "./DB"
import {r100} from "./functions"
import {Rand} from "./Rand"

export class User {
    static all: {[uid: number]: UserData} = {}

    static N = 1

    static BACK_BUTTON = "⬅️Назад"
    static BAG = "🧳Сумка"
    static PERKS = "🧬Перки"
    static ME = "👤Я"

    static createNew(from: TG_User): UserData {
        let u: UserData = {
            rand: {main: 0, talk: 0},
            ap: 0,
            level: 1,
            max_level: 1,
            dexterity: 3,
            intellect: 3,
            vitality: 3,
            strength: 3,
            uid: from.id,
            // short_uid: uid2shortUid(ctx.uid),
            short_uid: User.N++ + "",
            first_name: from.first_name,
            last_name: from.last_name,
            username: from.username,
            hp: 0,

            chips: 0,
            losable_chips: 0,
            limi: 0,
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

        if (t === "/refresh" || t === User.BACK_BUTTON) {
            await Game.draw(u)
            return true
        }

        if (t === "/me" || t === User.ME) {
            const {vitality, strength, dexterity, intellect} = u
            let m = `${User.getName(u)}\n`
            m += `${User.getStatusBar(u)}\n`
            m += `Здоровье: ${vitality}\n`
            m += `Сила: ${strength}\n`
            m += `Ловкость: ${dexterity}\n`
            m += `Ум: ${intellect}\n`

            await send(u, m, [[User.BACK_BUTTON]])
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

    static getStatusBar(u: UserData): string {
        const {hp} = u
        const max_hp = User.getMaxHP(u)
        const max_ap = User.getMaxAP(u)
        const attack = User.getDamage(u)
        const armor = User.getArmor(u)

        let m = `⚔️${attack} 🛡${armor}  ❤️${hp}/${max_hp}  🔋${max_ap}`

        return m
    }

    static restoreBars(u: UserData) {
        u.hp = User.getMaxHP(u)
        u.ap = User.getMaxAP(u)
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
