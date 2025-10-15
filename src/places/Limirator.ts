import {LContext} from "../server"
import {UserData} from "../UserData"
import {send} from "../TG"
import {User} from "../User"
import {Zero} from "./Zero"

export class Limirator {
    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx
        if (u.place.name !== "zero") {
            return false
        }

        return false
    }

    static async draw(u: UserData) {
        if (u.place.name !== "zero") {
            console.log(`ERROR: uid=${u.uid} try zero draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = `💎Лимиратор\n`
        m += `Генерирует экипировку за лими`
        await send(u.uid, m, [[Zero.TO_ZONE], [User.ME]], "main/zero_1.jpeg")
    }
}
