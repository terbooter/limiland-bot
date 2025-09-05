import {UserData} from "./UserData"
import {Zero} from "./places/Zero"
import {Intro} from "./places/Intro"
import {send} from "./TG"
import {Zone} from "./places/Zone"
import {MOB} from "./MOB"
import {Talk} from "./places/Talk"
import {User} from "./User"

export class Game {
    static async draw(u: UserData) {
        if (u.place.name === "zero") {
            await Zero.draw(u)
            return
        }
        if (u.place.name === "zone") {
            await Zone.draw(u)
            return
        }
        if (u.place.name === "mob") {
            await MOB.draw(u)
            return
        }
        if (u.place.name === "intro") {
            await Intro.draw(u)
            return
        }
        if (u.place.name === "talk") {
            await Talk.draw(u)
            return
        }

        if (u.place.name === "timer") {
            await send(u.uid, u.place.description, [[User.ME]])
            return
        }
    }
}
