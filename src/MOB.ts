import {UserData} from "./UserData"
import {send} from "./TG"
import {LContext} from "./server"
import {User} from "./User"
import {getRandomItem} from "./functions"
import {Game} from "./Game"
import {Util} from "./Util"

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

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (u.place.name !== "mob") {
            return false
        }

        if (t == MOB.ATTACK || t === MOB.BLOCK || t === MOB.REGEN) {
            if (t == MOB.ATTACK || t === MOB.BLOCK) {
                if (u.ap === 0) {
                    await send(u, `Не хватает ОД`)
                    return true
                }
            }

            let {m, state} = MOB.execRound(u, t)

            if (state === "battle") {
                await Game.draw(u)
                await send(u, m)
                return true
            }

            if (state === "win") {
                u.place = u.place.win_place
                await send(u, `🎉Ты победил!`)
            } else if (state === "loose") {
                u.place = u.place.loose_place
                await send(u, `💀Ты проиграл...`)
            }

            await Game.draw(u)
            return true
        }

        return false
    }

    static execRound(
        u: UserData,
        user_move: string
    ): {
        m: string
        state: "win" | "loose" | "battle"
    } {
        if (u.place.name !== "mob") {
            return {m: `ERROR: can not exec round place=${u.place.name}`, state: "battle"}
        }
        const place = u.place
        const mob = place.mob
        place.round++

        let mob_move = getRandomItem([MOB.ATTACK, MOB.BLOCK, MOB.REGEN])
        let mob_total_armor = mob.armor
        let mob_total_attack = mob.attack
        let mob_extra_armor = 0

        if (mob.ap === 0) {
            mob_move = MOB.REGEN
        }

        if (mob_move === MOB.BLOCK) {
            mob.ap--
            mob_extra_armor = Math.floor(mob.armor * 0.5) + 1
            mob_total_armor += mob_extra_armor
            mob.attack_boost += Math.floor(mob.attack * 0.1) + 1
        } else if (mob_move === MOB.ATTACK) {
            mob.ap--
            mob_total_attack += mob.attack_boost
            mob.attack_boost = 0
        } else if (mob_move === MOB.REGEN) {
            mob.attack_boost = 0
            mob.ap++
            if (mob.ap >= mob.max_ap) {
                mob.ap = mob.max_ap
            }
        }

        let user_total_armor = User.getArmor(u)
        let user_extra_armor = 0
        let user_total_attack = User.getDamage(u)

        if (user_move === MOB.ATTACK) {
            u.ap--
            user_total_attack += place.attack_boost
            place.attack_boost = 0
        } else if (user_move === MOB.BLOCK) {
            u.ap--
            user_extra_armor = Math.floor(User.getArmor(u) * 0.5) + 1
            user_total_armor += user_extra_armor
            u.place.attack_boost += Math.floor(mob.attack * 0.1) + 1
        } else if (user_move === MOB.REGEN) {
            place.attack_boost = 0
            u.ap++
            if (u.ap > User.getMaxAP(u)) {
                u.ap = User.getMaxAP(u)
            }
        }

        let user_message = ``
        let mob_message = ``

        let m = ``
        if (user_move === MOB.ATTACK) {
            let user_damage = user_total_attack - mob_total_armor
            if (user_damage < 0) {
                user_damage = 0
            }

            user_message = `👤Ты ударил 💥${user_damage}\n`

            mob.hp -= user_damage
            if (mob.hp < 0) {
                mob.hp = 0
            }
        } else if (user_move === MOB.BLOCK) {
            user_message = `👤Ты поставил блок ${user_total_armor}(${User.getArmor(u)}+${user_extra_armor})🛡️ `
            user_message += `Буст атаки: +${place.attack_boost}⚡\n`
        } else if (user_move === MOB.REGEN) {
            user_message = `👤Ты отдохнул +1🔋\n`
        }

        if (mob.hp === 0) {
            m += ``
            return {m, state: "win"}
        }

        m += ``

        if (mob_move === MOB.ATTACK) {
            let mob_damage = mob_total_attack - user_total_armor
            if (mob_damage < 0) {
                mob_damage = 0
            }
            mob_message = `${mob.pic} Моб ударил 💥${mob_damage}\n`

            u.hp -= mob_damage
            if (u.hp < 0) {
                u.hp = 0
            }
        } else if (mob_move === MOB.BLOCK) {
            mob_message = `${mob.pic} Моб поставил блок ${mob_total_armor}(${mob.armor}+${mob_extra_armor})🛡 `
            mob_message += `Буст атаки: +${mob.attack_boost}⚡\n`
        } else if (mob_move === MOB.REGEN) {
            mob_message = `${mob.pic} Моб отдохнул +1🔋\n`
        }

        if (u.hp === 0) {
            m += ``
            return {m, state: "loose"}
        }

        m += user_message
        m += mob_message
        m += `\n`
        m += `${mob.pic} `
        m += `⚔️${mob.attack + mob.attack_boost} 🛡${mob.armor} 🔋${mob.ap}/${mob.max_ap} ⚡${mob.attack_boost}\n`
        m += `❤️${Util.getProgressBar(mob.hp, mob.max_hp)} ${mob.hp}/${mob.max_hp}\n`
        m += `\n`
        m += `👤  ⚔️${User.getDamage(u) + u.place.attack_boost} 🛡${User.getArmor(u)}`
        m += ` 🔋${u.ap}/${User.getMaxAP(u)} ⚡${place.attack_boost}\n`
        m += `❤️${Util.getProgressBar(u.hp, User.getMaxHP(u))} ${u.hp}/${User.getMaxHP(u)}\n`

        return {m, state: "battle"}
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
        } else {
            m = `Бой с ${mob.pic}${mob.name} Раунд ${u.place.round}\n`
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
