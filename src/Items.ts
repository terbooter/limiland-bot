import * as fs from "fs/promises"
import * as YAML from "yaml"

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
}

export type YAML_Item = {
    pic: string
    id: number
    name: string
    usable?: true
}
