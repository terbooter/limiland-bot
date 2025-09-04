import {UserData} from "../UserData"
import {send} from "../TG"
import {LContext} from "../server"
import {Game} from "../Game"
import {User} from "../User"

export class Zero {
    static TO_ZONE = "🚧В Путь"
    static MEDIC = "🏥Медик"
    static ENGINEER = "🛠️Инженер"
    static JOB = "♻ Работа"
    static OWL = "🦉Сов"
    static SHOP = "🏪Магазин"
    static ZERO = "🌐Зероград"
    static HOME = "🛖Дом"

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx
        if (u.place.name !== "zero") {
            return false
        }

        if (t === Zero.TO_ZONE) {
            const idle = 2
            u.place = {
                name: "timer",
                startedAt: Date.now(),
                scheduledAt: Date.now() + idle * 1_000,
                description: `⏳[${idle} сек.] Идем по спирали ...`,
                target_place: {
                    name: "zone",
                    level: u.place.last_level
                }
            }

            await Game.draw(u)
            return true
        }

        return false
    }

    static async draw(u: UserData) {
        if (u.place.name !== "zero") {
            console.log(`ERROR: uid=${u.uid} try zero draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = `🌐Зероград\n`
        m += `Центр Великой Спирали`
        await send(u.uid, m, [[Zero.TO_ZONE], [User.ME]])
    }
}
