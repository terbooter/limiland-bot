import {LContext} from "./server"

export class Final {
    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (t.substring(0, 6) === "/start") {
            if (u.place.name !== "intro") {
                u.m = `Ты уже создал персонажа`
                return true
            }
        }

        return false
    }
}
