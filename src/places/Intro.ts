import {LContext} from "../server"
import {User} from "../User"
import {DB} from "../DB"
import {send, TG} from "../TG"
import {intros} from "./intro_steps"
import {UserData} from "../UserData"
import {Game} from "../Game"

export class Intro {
    static async draw(u: UserData) {
        if (u.place.name !== "intro") {
            console.log(`ERROR: uid=${u.uid} try draw intro but place = ${JSON.stringify(u.place)}`)
            return
        }

        let e = intros[u.place.step]
        let m = `${e.text}`
        await send(u.uid, m, [[e.button]])
    }

    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (u.place.name !== "intro") {
            return false
        }

        if (t.substring(0, 6) === "/start") {
            if (u.place.step !== 0) {
                u.m = `Ты уже создал персонажа. Проходим обучение`
                return true
            }

            let m = `Привет, ${User.getName(u)}`
            await TG.s(uid, m)

            await DB.saveUser(u)

            if (t.length > 6) {
                let arr = t.split(" ")

                if (arr[1]) {
                    let referrer_uid = parseInt(arr[1])
                    if (Number.isInteger(referrer_uid) && referrer_uid != uid) {
                        // await TG.s(uid, `REFERRER=${arr[1]}`)
                        const sql = `UPDATE users SET parent_uid=$1 WHERE uid=$2`
                        await DB.query(sql, [referrer_uid, uid])

                        let sql_ref = `insert into refs (parent_uid, child_uid, created_at)
                                        VALUES ($1, $2, now())
                                        ON CONFLICT (parent_uid, child_uid) DO NOTHING ;`

                        await DB.query(sql_ref, [referrer_uid, u.uid])
                    }
                }
            }

            await Intro.draw(u)
            return true
        }

        if (t === intros[intros.length - 1].button) {
            u.place = {
                name: "zero",
                last_level: 1
            }

            await send(u.uid, `Обучение завершено`)
            await Game.draw(u)
            return true
        }

        for (let i = 0; i < intros.length; i++) {
            if (t === intros[i].button) {
                u.place.step++
                await Intro.draw(u)
                return true
            }
        }

        // if (t.startsWith("intro_")) {
        //     const passedStep = parseInt(t.replace("intro_", ""))
        //
        //     if (passedStep < intros.length - 1) {
        //         let step = passedStep + 1
        //         const k = {
        //             reply_markup: {
        //                 inline_keyboard: [
        //                     [
        //                         {
        //                             text: intros[step].button,
        //                             callback_data: `intro_${step}`
        //                         }
        //                     ]
        //                 ]
        //             }
        //         }
        //
        //         await TG.s(uid, intros[step].text, k)
        //     } else {
        //         // Intro completed
        //         u.tutorial = 0
        //         await TG.s(uid, `Введение завершено`)
        //         await TG.s(uid, Tutorial.data[0].in)
        //         await Zero.placeToRoot(ctx.u)
        //     }
        //
        //     const buttonText = ctx.buttonText
        //     await ctx.editMessageReplyMarkup({
        //         inline_keyboard: [[{text: `✔️${buttonText}`, callback_data: `used`}]]
        //     })
        //     return true
        // }

        return false
    }
}
