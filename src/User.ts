import {UserData} from "./UserData"
import {TG_User} from "./TG"
import {Config} from "./Config"

export class User {
    static all: {[uid: number]: UserData} = {}

    static N = 1

    static createNew(from: TG_User): UserData {
        let u: UserData = {
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
}
