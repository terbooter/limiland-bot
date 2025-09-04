import {UserData} from "./UserData"
import {send} from "./TG"
import {LContext} from "./server"
import {User} from "./User"
import {getRandomItem} from "./functions"
import {Game} from "./Game"

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

        if (t == MOB.ATTACK || t === MOB.BLOCK) {
            if (u.ap === 0) {
                await send(u, `Не хватает ОД`)
                return true
            }

            MOB.execRound(u, t)
            await Game.draw(u)
            return true
        }
        if (t == MOB.REGEN) {
            MOB.execRound(u, t)
            await Game.draw(u)
            return true
        }

        return false
    }

    static execRound(u: UserData, user_move: string) {
        if (u.place.name !== "mob") {
            return `ERROR: can not exec round place=${u.place.name}`
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

        let m = `Раунд ${place.round}\n\n`
        if (user_move === MOB.ATTACK) {
            let user_damage = user_total_attack - mob_total_armor
            if (user_damage < 0) {
                user_damage = 0
            }
            m += `👤Ты ударил 💥${user_damage}\n`

            mob.hp -= user_damage
            if (mob.hp < 0) {
                mob.hp = 0
            }
        } else if (user_move === MOB.BLOCK) {
            m += `👤Ты заблокировал ${user_total_armor}(${User.getArmor(u)}+${user_extra_armor})🛡️ `
            m += `Буст атаки: +${place.attack_boost}⚡\n`
        } else if (user_move === MOB.REGEN) {
            m += `👤Ты отдохнул +1🔋\n`
        }

        m += ``

        if (mob_move === MOB.ATTACK) {
            let mob_damage = mob_total_attack - user_total_armor
            if (mob_damage < 0) {
                mob_damage = 0
            }
            m += `${mob.pic} Моб ударил 💥${mob_damage}\n`

            u.hp -= mob_damage
            if (u.hp < 0) {
                u.hp = 0
            }
        } else if (mob_move === MOB.BLOCK) {
            m += `${mob.pic} Моб заблокировал ${mob_total_armor}(${mob.armor}+${mob_extra_armor})🛡 `
            m += `Буст атаки: +${mob.attack_boost}⚡\n`
        } else if (mob_move === MOB.REGEN) {
            m += `${mob.pic} Моб отдохнул +1🔋\n`
        }

        m += `\n`

        m += `👤  ⚔️${User.getDamage(u) + u.place.attack_boost} 🛡${User.getArmor(u)}`
        m += ` ❤️${u.hp}/${User.getMaxHP(u)}  🔋${u.ap}/${User.getMaxAP(u)} ⚡${place.attack_boost}\n`
        m += `${mob.pic}  ⚔️${mob.attack + mob.attack_boost} 🛡${mob.armor} ❤️${mob.hp}/${mob.max_hp} 🔋${mob.ap}/${mob.max_ap} ⚡${mob.attack_boost}\n`

        place.m = m
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
            m = u.place.m!
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
