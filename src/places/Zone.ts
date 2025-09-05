import {LContext} from "../server"
import {MobPlace, Place, UserData} from "../UserData"
import {send} from "../TG"
import {Game} from "../Game"
import {User} from "../User"
import {MOB} from "../MOB"
import {Talk} from "./Talk"

export class Zone {
    static GO_FURTHER = "👣Исследовать"
    static GO_ZERO = "🌐Вернуться"

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (u.place.name !== "zone") {
            return false
        }

        if (t === Zone.GO_FURTHER) {
            Zone.nextMain(u)

            await Game.draw(u)
            return true
        }

        if (t === Zone.GO_ZERO) {
            const idle = 2
            u.place = {
                name: "timer",
                startedAt: Date.now(),
                scheduledAt: Date.now() + idle * 1_000,
                description: `⏳[${idle} сек.] Возвращаешься ...`,
                target_place: {
                    name: "zero"
                }
            }

            await Game.draw(u)
            return true
        }

        return false
    }

    static nextMain(u: UserData) {
        let target_place: any

        let r = User.nextRand("main", u)
        if (r === "mob") {
            let mob_place: MobPlace = {
                name: "mob",
                mob: MOB.getMob(1),
                round: 0,
                attack_boost: 0,
                win_place: {
                    name: "zone"
                },
                loose_place: {
                    name: "zero"
                }
            }

            target_place = mob_place
        } else if (r === "talk") {
            let r = User.nextRand("talk", u)
            target_place = Talk.getPlace(r, "0")
        } else {
            target_place = {
                name: "zone"
            }
        }

        const idle = 2
        u.place = {
            name: "timer",
            startedAt: Date.now(),
            scheduledAt: Date.now() + idle * 1_000,
            description: `⏳[${idle} сек.] Исследуешь круг ...`,
            target_place: target_place
        }
    }

    static async draw(u: UserData) {
        if (u.place.name !== "zone") {
            console.log(`ERROR: uid=${u.uid} try zone draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        User.restoreBars(u)

        let m = `🌀 ${u.level} Круг | Спираль\n`
        m += User.getStatusBar(u)
        await send(u.uid, m, [[Zone.GO_FURTHER], [Zone.GO_ZERO]])
    }
}
