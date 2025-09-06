import {UserData} from "./UserData"
import {send} from "./TG"
import {LContext} from "./server"
import {User} from "./User"
import {getRandomItem} from "./functions"
import {Game} from "./Game"
import {Util} from "./Util"
import * as fs from "fs/promises"
import * as YAML from "yaml"
import {DB} from "./DB"

export class MOB {
    static ATTACK = `Атака`
    static BLOCK = `Блок`
    static REGEN = `Отдых`

    static list: YAML_Mob[]

    static getMob(level: number): Mob {
        const armor = Math.floor(level * 0.1)
        const attack = Math.floor(level * 0.5) + 1
        const max_hp = Math.floor(level * 1.2) + 5
        const max_ap = Math.floor(level * 0.2) + 3

        let mob: Mob = {
            pic: "🎃",
            name: "Тыква",
            armor: armor,
            attack: attack,
            credo: "",
            hp: max_hp,
            max_hp: max_hp,
            ap: max_ap,
            max_ap: max_ap,
            boost: 0,
            boost_count: 0
        }

        let list_mob = getRandomItem(MOB.list)

        mob.pic = list_mob.pic
        mob.credo = list_mob.credo
        mob.name = list_mob.name

        return mob
    }

    static async load() {
        const file = await fs.readFile("./src/files/mobs.yaml", "utf8")
        MOB.list = YAML.parse(file).list
    }

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (u.place.name !== "mob") {
            return false
        }

        if (t == MOB.ATTACK || t === MOB.BLOCK || t === MOB.REGEN) {
            if (t == MOB.ATTACK || t === MOB.BLOCK) {
                if (u.ap === 0) {
                    await send(u, `🪫Не хватает AP`)
                    return true
                }
            }

            let o = MOB.execRound(u, t)

            if (!o) {
                await send(u, `ERROR: MOB.execRound return null`)
                return true
            }

            let {first, second, state} = o

            await send(u, first)
            if (second !== "") {
                await send(u, second)
            }

            if (state === "continue") {
                // await Game.draw(u)
                return true
            }

            if (state === "win") {
                u.place = u.place.win_place
                await send(u, `🎉Ты победил!`)
                await DB.updateCounter(uid, "kill")
                await DB.updateCounter(uid, `kill_${u.level}`)
            } else if (state === "loose") {
                u.place = u.place.loose_place
                await send(u, `💀Ты проиграл...`)
                await DB.updateCounter(uid, "loose")
                await DB.updateCounter(uid, `loose_${u.level}`)
            }

            await Game.draw(u)
            return true
        }

        return false
    }

    static generateMobMove(u: UserData): string | undefined {
        if (u.place.name !== "mob") {
            console.log(`ERROR: can not exec round place=${u.place.name}`)
            return
        }

        const mob = u.place.mob

        let mob_move = getRandomItem([MOB.ATTACK, MOB.BLOCK, MOB.REGEN])

        if (mob.ap === 0) {
            mob_move = MOB.REGEN
        }

        return mob_move
    }

    static execStep(aggressor: BattleUnit, victim: BattleUnit) {}

    static execRound(
        u: UserData,
        user_move: string
    ): {
        first: string
        second: string
        state: "continue" | "win" | "loose"
    } | null {
        if (u.place.name !== "mob") {
            console.log(`ERROR: can not exec round place=${u.place.name}`)

            return null
        }
        const place = u.place
        const mob = place.mob
        place.round++

        let mob_move = MOB.generateMobMove(u)
        let mob_armor = mob.armor
        let mob_attack = mob.attack

        if (mob_move === MOB.BLOCK) {
            mob.ap--
            mob_armor = mob.armor + Math.floor(mob.armor * 0.5) + 1
            mob.boost += Math.floor(mob.attack * 0.1) + 1
            mob.boost_count++
        } else if (mob_move === MOB.ATTACK) {
            mob.ap--
            mob_attack = mob.attack + mob.boost
            mob.boost = 0
            mob.boost_count = 0
        } else if (mob_move === MOB.REGEN) {
            mob.boost = 0
            mob.boost_count = 0
            mob.ap++
            if (mob.ap >= mob.max_ap) {
                mob.ap = mob.max_ap
            }
        }

        const {getArmor, getMaxAP, getMaxHP, getDamage} = User
        const bar = Util.getProgressBar

        let user_armor = getArmor(u)
        let user_attack = getDamage(u)

        if (user_move === MOB.ATTACK) {
            u.ap--
            user_attack = getDamage(u) + place.boost
            place.boost = 0
            place.boost_count = 0
        } else if (user_move === MOB.BLOCK) {
            u.ap--
            user_armor = getArmor(u) + Math.floor(getArmor(u) * 0.5) + 1
            u.place.boost += Math.floor(mob.attack * 0.1) + 1
            u.place.boost_count++
        } else if (user_move === MOB.REGEN) {
            place.boost = 0
            place.boost_count = 0
            u.ap++
            if (u.ap > getMaxAP(u)) {
                u.ap = getMaxAP(u)
            }
        }

        let user_message = ``
        let mob_message = ``

        if (user_move === MOB.ATTACK) {
            let user_damage = user_attack - mob_armor
            if (user_damage < 0) {
                user_damage = 0
            }

            user_message = `<b>👤Ты нанес урон 💥${user_damage}\n</b>`
            if (mob_armor) {
                let icon = `🛡️`
                if (mob_move === MOB.BLOCK) {
                    icon = `🔰`
                }
                user_message += `${mob.name} заблокировал ${icon}${mob_armor}\n`
            }

            mob.hp -= user_damage
            if (mob.hp < 0) {
                mob.hp = 0
            }
        } else if (user_move === MOB.BLOCK) {
            user_message = `<b>👤Ты поставил блок ${user_armor}🔰️</b> `

            let iconStr = ``
            for (let i = 0; i < place.boost_count; i++) {
                iconStr += `⚡`
            }

            user_message += `Буст: ${place.boost}${iconStr}\n`
        } else if (user_move === MOB.REGEN) {
            user_message = `<b>👤Ты отдохнул +1🔋 ${u.ap}/${getMaxAP(u)}\n</b>`
        }

        user_message += `\n`
        user_message += `🖤Здоровье ${mob.name}:  ${mob.hp}/${mob.max_hp}\n`
        user_message += `${bar(mob.hp, mob.max_hp)}`

        if (mob.hp === 0) {
            return {first: user_message, second: "", state: "win"}
        }

        mob_message = `⛓️\n\n`
        if (mob_move === MOB.ATTACK) {
            let mob_damage = mob_attack - user_armor
            if (mob_damage < 0) {
                mob_damage = 0
            }
            mob_message += `${mob.pic} ${mob.name} нанес урон 💥${mob_damage}\n`
            if (user_armor) {
                let icon = `🛡️`
                if (user_move === MOB.BLOCK) {
                    icon = `🔰`
                }
                user_message += `Ты заблокировал ${icon}${user_armor}\n`
            }

            u.hp -= mob_damage
            if (u.hp < 0) {
                u.hp = 0
            }
        } else if (mob_move === MOB.BLOCK) {
            mob_message += `${mob.pic} ${mob.name} поставил блок ${mob_armor}🔰️ `
            let iconStr = ``
            for (let i = 0; i < mob.boost_count; i++) {
                iconStr += `⚡`
            }
            mob_message += `Буст: ${mob.boost}${iconStr}\n`
        } else if (mob_move === MOB.REGEN) {
            mob_message += `${mob.pic} ${mob.name} отдохнул +1🔋 ${mob.ap}/${mob.max_ap}\n`
        }

        let ap_icon = `🔋`
        if (u.ap === 0) {
            ap_icon = `🪫`
        }
        mob_message += `\n`
        mob_message += `<b>❤️Ты</b>: ${u.hp}/${getMaxHP(u)}\n`
        mob_message += `${bar(u.hp, getMaxHP(u))}\n`
        mob_message += `${ap_icon}${u.ap}/${getMaxAP(u)}\n`
        mob_message += `\n`

        ap_icon = `🔋`
        if (mob.ap === 0) {
            ap_icon = `🪫`
        }
        mob_message += `🖤${mob.name}:  ${mob.hp}/${mob.max_hp}\n`
        mob_message += `${bar(mob.hp, mob.max_hp)}\n`
        mob_message += `${ap_icon}${mob.ap}/${mob.max_ap}\n`

        if (u.hp === 0) {
            return {first: user_message, second: mob_message, state: "loose"}
        }

        // m += user_message
        // m += mob_message
        // m += `\n`
        // m += `${mob.pic} `
        // m += `⚔️${mob.attack + mob.boost} 🛡${mob.armor} 🔋${mob.ap}/${mob.max_ap} ⚡${mob.boost}\n`
        // m += `❤️${bar(mob.hp, mob.max_hp)} ${mob.hp}/${mob.max_hp}\n`
        // m += `\n`
        // m += `👤  ⚔️${User.getDamage(u) + u.place.boost} 🛡${User.getArmor(u)}`
        // m += ` 🔋${u.ap}/${User.getMaxAP(u)} ⚡${place.boost}\n`
        // m += `❤️${bar(u.hp, User.getMaxHP(u))} ${u.hp}/${User.getMaxHP(u)}\n`

        return {first: user_message, second: mob_message, state: "continue"}
    }

    static async draw(u: UserData) {
        if (u.place.name !== "mob") {
            console.log(`ERROR: uid=${u.uid} try MOB draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = ``
        const mob = u.place.mob
        if (u.place.round === 0) {
            m += `Нападение!\n\n`
            m += `${mob.pic}<b>${mob.name}</b> <i>(${mob.credo})</i>\n`
            m += `⚔️${mob.attack} 🛡️${mob.armor} ❤️${mob.hp}/${mob.max_hp} 🔋${mob.ap}/${mob.max_ap}\n`
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
    boost: number
    boost_count: number
    armor: number
    hp: number
    max_hp: number
    ap: number
    max_ap: number
}

export type BattleMove = {
    actor: "user" | "mob"
    result: "battle" | "win" | "loose"

    move: AttackMove | BlockMove | RegenMove | null
}

export type AttackMove = {
    name: "attack"
    total_damage: number
    base_damage: number
    boost: number
    boost_count: number
    penetrated_damage: number
    absorbed_damage: number
}

export type BlockMove = {
    name: "block"
    total_damage: number
    penetrated_damage: number
    absorbed_damage: number
    boost: number
    boost_count: number
}

export type RegenMove = {
    name: "regen"
    total_damage: number
    penetrated_damage: number
    absorbed_damage: number
    boost: number
    boost_count: number
}

export type BattleUnit = {
    ap: number
    max_ap: number
    hp: number
    max_hp: number
    armor: number
    attack: number
    move: "attack" | "block" | "regen"
}

export type YAML_Mob = {
    pic: string
    name: string
    credo: string
    strikes: string[]
}
