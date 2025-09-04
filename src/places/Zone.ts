import {LContext} from "../server"
import {UserData} from "../UserData"
import {send} from "../TG"
import {Game} from "../Game"

export class Zone {
    static GO_FURTHER = "👣Исследовать"
    static GO_ZERO = "🌐Вернуться"

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (u.place.name !== "zone") {
            return false
        }

        if (t === Zone.GO_FURTHER) {
            const idle = 2
            u.place = {
                name: "timer",
                startedAt: Date.now(),
                scheduledAt: Date.now() + idle * 1_000,
                description: `⏳[${idle} сек.] Исследуешь круг ...`,
                target_place: {
                    name: "zone",
                    level: u.place.level
                }
            }

            await Game.draw(u)
            return true
        }

        return false
    }

    static async draw(u: UserData) {
        if (u.place.name !== "zone") {
            console.log(`ERROR: uid=${u.uid} try zone draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = `🌀 ${u.place.level} Круг | Спираль\n`
        await send(u.uid, m, [[Zone.GO_FURTHER], [Zone.GO_ZERO]])
    }
}
