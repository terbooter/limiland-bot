import {LContext} from "../server"
import {UserData} from "../UserData"
import {send} from "../TG"
import {User} from "../User"
import {Zero} from "./Zero"
import {CORE_ID, LIMI_ID} from "../Constants"
import {multi100} from "../functions"

export class Limirator {
    static GENERATE_10 = `Генерация за 10💎`
    static GENERATE_100 = `Генерация за 100💎`

    static reward = [
        {
            chance: 0.5,
            value: "core"
        },
        {
            chance: 1,
            value: "weapon"
        },
        {
            chance: 1,
            value: "suit"
        },
        {
            chance: 1,
            value: "helmet"
        }
    ]

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx
        if (u.place.name !== "zero") {
            return false
        }

        if (t === Zero.LIMIRATOR) {
            await Limirator.draw(u)
            return true
        }

        if (t === Limirator.GENERATE_10 || t === Limirator.GENERATE_100) {
            let limi = 10
            if (t === Limirator.GENERATE_100) {
                limi = 100
            }

            let check = User.checkItemsCount(u, [{item_id: LIMI_ID, count: limi}])
            if (check) {
                await send(uid, check)
                return true
            }

            let r = Limirator.generate(u, limi)
            await send(uid, JSON.stringify(r))
            return true
        }

        return false
    }

    static async draw(u: UserData) {
        if (u.place.name !== "zero") {
            console.log(`ERROR: uid=${u.uid} try zero draw but place = ${JSON.stringify(u.place)}`)
            return
        }

        let m = `💎Лимиратор\n`
        m += `Генерирует экипировку за лими`
        await send(
            u.uid,
            m,
            [[Limirator.GENERATE_10], [Limirator.GENERATE_100], [Zero.ZERO]],
            "main/zero_1.jpeg"
        )
    }

    static generate(u: UserData, n: number = 1): number[] {
        let r: number[] = []
        let chances = Limirator.reward.map((x) => x.chance)
        for (let i = 0; i < n; i++) {
            let index = multi100(chances)
            if (index !== false) {
                const type = Limirator.reward[index].value

                r.push(Limirator.getRewardItem(type))
            }
        }

        return r
    }

    static getRewardItem(type: string): number {
        switch (type) {
            case "core":
                return CORE_ID
            case "weapon":
                return 4
            case "suit":
                return 4
            case "helmet":
                return 125
        }
        return 0
    }
}
