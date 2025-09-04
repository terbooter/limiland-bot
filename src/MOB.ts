import {UserData} from "./UserData"
import {send} from "./TG"

export class MOB {
    static ATTACK = `Атака`
    static BLOCK = `Блок`
    static REGEN = `Отдых`

    static getMob(level: number): Mob {
        let mob: Mob = {
            pic: "🎃",
            name: "Тыква",
            armor: 1,
            attack: 2,
            credo: "",
            hp: 10,
            max_hp: 10,
            ap: 5,
            max_ap: 5,
            attack_boost: 0
        }

        return mob
    }

    static async draw(u: UserData) {
        if (u.place.name !== "mob") {
            console.log(`ERROR: uid=${u.uid} try MOB draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = ``
        const mob = u.place.mob
        if (u.place.round === 0) {
            m += `Нападение!\n`
            m += `Моб: ${mob.pic}${mob.name} ❤️${mob.hp}/${mob.max_hp} 🔋${mob.ap}/${mob.max_ap}\n`
            m += `Атака: ${mob.attack}\n`
            m += `Броня: ${mob.armor}\n`
        }

        await send(u.uid, m, [[MOB.BLOCK, MOB.ATTACK], [MOB.REGEN]])
    }
}

export type Mob = {
    pic: string
    name: string
    credo: string
    attack: number
    attack_boost: number
    armor: number
    hp: number
    max_hp: number
    ap: number
    max_ap: number
}
