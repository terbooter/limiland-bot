import {LContext} from "../server"
import {MobPlace, UserData} from "../UserData"
import {send} from "../TG"
import {Game} from "../Game"
import {User} from "../User"
import {MOB} from "../MOB"
import {Talk} from "./Talk"
import {Zero} from "./Zero"

export class Zone {
    static GO_FURTHER = "👣Исследовать"
    static GO_TO_CENTER = "К центру"
    static GO_FROM_CENTER = "От центра"
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

        if (t === Zone.GO_TO_CENTER) {
            if (u.level === 1) {
                await send(
                    u,
                    `Это первый круг спирали, чтобы вернуться в Зероград, нажми ${Zero.ZERO}`
                )
                return true
            }

            const idle = 2
            u.place = {
                name: "timer",
                startedAt: Date.now(),
                scheduledAt: Date.now() + idle * 1_000,
                description: `⏳[${idle} сек.] Идем на ближний к центру круг ...`,
                target_place: {
                    name: "zone"
                }
            }
            u.level--

            await Game.draw(u)
            return true
        }
        if (t === Zone.GO_FROM_CENTER) {
            const idle = 2
            u.place = {
                name: "timer",
                startedAt: Date.now(),
                scheduledAt: Date.now() + idle * 1_000,
                description: `⏳[${idle} сек.] Идем на дальний от центра круг ...`,
                target_place: {
                    name: "zone"
                }
            }
            u.level++

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
                mob: MOB.getMob(u.level),
                round: 0,
                boost: 0,
                boost_count: 0,
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
        await send(u.uid, m, [
            [Zone.GO_FURTHER],
            [Zone.GO_TO_CENTER, Zone.GO_FROM_CENTER],
            [Zone.GO_ZERO]
        ])
    }
}
