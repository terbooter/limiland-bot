import * as fs from "fs/promises"
import * as YAML from "yaml"
import {LContext} from "./server"
import {send} from "./TG"
import {UserData} from "./UserData"
import {User} from "./User"
import {DEXTERITY, INTELLECT, STRENGTH, VITALITY} from "./Constants"

export class Items {
    static all: {[id: string]: YAML_Item} = {}

    static async load() {
        const file = await fs.readFile("./src/files/items.yaml", "utf8")
        const obj = YAML.parse(file)

        for (const item of obj) {
            Items.all[item.id] = item
        }

        console.log(Items.all)
    }

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (t.startsWith("/item_")) {
            const item_id = parseInt(t.split("_")[1])

            const item = Items.all[item_id]
            if (!item) {
                await send(u, `Нет предмета с item_id=${item_id}`)
                return true
            }
            await Items.drawItem(item_id, u)
            return true
        }

        if (t.startsWith("/use_")) {
            const item_id = parseInt(t.split("_")[1])

            const item = Items.all[item_id]
            if (!item) {
                await send(u, `Нет предмета с item_id=${item_id}`)
                return true
            }

            if (!item.usable) {
                await send(
                    u,
                    `<b>${item.pic}${item.name}</b>: Такие предметы не могут быть использованы`
                )
                return true
            }

            if (item_id === 3) {
                const item = Items.all[item_id]
                let m = `Ты решил использовать ${Items.str(item_id)}\n`
                m += `Выбери характеристику которую хочешь улучшить:\n\n`
                m += `${VITALITY} +1: /up_vitality\n`
                m += `${STRENGTH} +1: /up_strength\n`
                m += `${DEXTERITY} +1: /up_dexterity\n`
                m += `${INTELLECT} +1: /up_intellect\n`

                await send(u, m)
                return true
            }

            await send(u, `В разработке`)
            return true
        }

        if (t.startsWith("/up_")) {
            const param = t.split("_")[1]

            const c = User.getItemsCount(u, 3)

            if (c === 0) {
                await send(u, `У тебя нет ядер улучшения`)
                return true
            }

            let sub = ``

            if (param === "vitality") {
                sub = VITALITY
                u.vitality++
            } else if (param === "strength") {
                sub = STRENGTH
                u.strength++
            } else if (param === "dexterity") {
                sub = DEXTERITY
                u.dexterity++
            } else if (param === "intellect") {
                sub = INTELLECT
                u.intellect++
            }

            if (sub.length === 0) {
                return false
            }

            User.remItem(u, 3)
            let m = `<b>+1 ${sub}</b>\n`
            await send(u, m)
            return true
        }

        return false
    }

    static str(item_id): string {
        const item = Items.all[item_id]
        return `<b>${item.pic}${item.name}</b>`
    }

    static async drawItem(id: number, u: UserData) {
        const item = Items.all[id]
        const c = User.getItemsCount(u, id)
        let m = `Карточка предмета:\n`
        m += `<b>${item.pic}${item.name}</b>\n`
        m += `У тебя есть: ${c} штук\n`

        if (item.info) {
            m += `\n`
            m += `${item.info}\n`
            m += `\n`
        }

        if (item.usable) {
            m += `Использовать: <b>/use_${id}</b>`
        }

        await send(u, m, [[User.BACK_BUTTON]])
    }
}

export type YAML_Item = {
    pic: string
    id: number
    name: string
    info?: string
    usable?: true
}
