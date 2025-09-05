import {Talk} from "./places/Talk"

export class Rand {
    static main = ["mob", "mob", "talk", "", "mob", "talk", "mob", ""]
    static talk: string[] = []

    static load() {
        Rand.talk = Object.keys(Talk.all)
    }
}
