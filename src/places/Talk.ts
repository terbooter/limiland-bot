import {LContext} from "../server"
import * as fs from "fs/promises"
import * as YAML from "yaml"
import {PlaceButton, TalkPlace, UserData} from "../UserData"
import {getRandomItem} from "../functions"
import {send} from "../TG"
import {Game} from "../Game"
import {Zone} from "./Zone"

export class Talk {
    static all: {[saga: string]: {[id: string]: YAML_Talk}} = {}

    static async load() {
        const file = await fs.readFile("./src/files/talks.yaml", "utf8")
        const obj = YAML.parse(file)

        Talk.all = obj

        console.dir(obj, {depth: null})
    }

    static async draw(u: UserData) {
        if (u.place.name !== "talk") {
            console.log(`ERROR: uid=${u.uid} try talk draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = u.place.text

        const b: string[][] = []

        const place = u.place

        let line1 = place.line1.map((x) => x.label)
        b.push(line1)

        if (place.line2) {
            b.push(place.line2.map((x) => x.label))
        }

        if (place.line3) {
            b.push(place.line3.map((x) => x.label))
        }

        await send(u.uid, m, b)
    }

    static getPlace(saga: string, id: string): TalkPlace | null {
        if (!Talk.all[saga] || !Talk.all[saga][id]) {
            console.log(`ERROR: no talk for saga=${saga} id=${id}`)
            return null
        }

        const data = Talk.all[saga][id]

        let r: TalkPlace = {
            name: "talk",
            text: data.text,
            line1: data.line1.map((x) => Talk.parseButtons(x, saga))
        }

        if (data.line2) {
            r.line2 = data.line2.map((x) => Talk.parseButtons(x, saga))
        }

        if (data.line3) {
            r.line3 = data.line3.map((x) => Talk.parseButtons(x, saga))
        }

        return r
    }

    static parseButtons(yaml: YAML_Talk_Button, saga: string): TalkPlace["line1"][0] {
        let label: string
        if (typeof yaml.label === "string") {
            label = yaml.label
        } else {
            label = getRandomItem(yaml.label)
        }

        let r: TalkPlace["line1"][0] = {
            label,
            target: {
                saga,
                id: yaml.target
            },
            actions: []
        }

        return r
    }

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx
        if (u.place.name !== "talk") {
            return false
        }

        let b = Talk.findButton(t, u.place)
        if (!b) {
            return false
        }

        if (b.target.id === "exit") {
            Zone.nextMain(u)
        } else {
            const new_place = Talk.getPlace(b.target.saga, b.target.id)
            if (!new_place) {
                let m = `ERROR: uid=${u.uid} Talk.getPlace empty for b =${JSON.stringify(b)}`
                console.log(m)
                await send(u, m)
                return true
            }

            u.place = new_place
        }

        await Game.draw(u)

        return false
    }

    static findButton(label: string, place: TalkPlace): PlaceButton | null {
        for (const b of place.line1) {
            if (b.label === label) {
                return b
            }
        }

        if (place.line2) {
            for (const b of place.line2) {
                if (b.label === label) {
                    return b
                }
            }
        }

        if (place.line3) {
            for (const b of place.line3) {
                if (b.label === label) {
                    return b
                }
            }
        }

        return null
    }
}

export type YAML_Talk = {
    id: string
    text: string
    line1: YAML_Talk_Button[]
    line2?: YAML_Talk_Button[]
    line3?: YAML_Talk_Button[]
}

export type YAML_Talk_Button = {
    label: string | string[]
    target: string
}
