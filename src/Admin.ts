import {LContext} from "./server"
import {s, send, TG} from "./TG"
import {DB} from "./DB"
import {User} from "./User"
import {Config} from "./Config"
import {Util} from "./Util"
import {Items} from "./Items"

export class Admin {
    static async exec(ctx: LContext): Promise<boolean> {
        const {uid, u, t} = ctx

        if (t === "/rules") {
            let m = `<b>Правила:</b>\n\n`
            m += `1. Запрещается использование любых средств автоматизации\n\n`
            await TG.s(uid, m)
            return true
        }

        if (t === "donate_50" || t === "donate_100" || t === "donate_300") {
            await TG.s(uid, `Мы еще не подключили платежи, вот-вот и все заработает!`)
            return true
        }

        if (t === "/donate") {
            let m = `<b>Спасибо за поддержку проекта!</b>\n\n`
            m += `Тут ты можешь приобрести лими\n\n`
            m += `Курс: 1💎 = 3₽\n\n`
            m += `Остались вопросы - пиши в чат <a href="${process.env.SUPPORT_CHAT_LINK}">Техподдержки</a>\n`

            const b = [
                [{text: "50💎", callback_data: "donate_50"}],
                [{text: "100💎", callback_data: "donate_100"}],
                [{text: "300💎", callback_data: "donate_300"}]
            ]
            const k = {
                reply_markup: {
                    inline_keyboard: b,
                    resize_keyboard: false
                },
                parse_mode: "HTML"
            }
            await TG.s(u.uid, m, k)

            return true
        }

        if (t === "/kill_me") {
            u.m = `В разработке`
            return true
        }

        if (t === "/top") {
            let m = `Топ игроков по дальности:\n\n`

            u.m = m

            return true
        }

        if (t === "/delete_my_account_from_game" || t === "/rs") {
            const allowedUids = Config.ADMIN_UIDS
            if (allowedUids.indexOf(uid) == -1) {
                await s(uid, `uid=${uid} not allowed`)
                return false
            }
            const tid = uid
            await DB.query("DELETE FROM users WHERE uid = $1", [tid])
            await DB.query("DELETE FROM objects WHERE uid = $1", [tid])
            await DB.query("DELETE FROM counters WHERE uid = $1", [tid])
            // @ts-ignore
            delete ctx.u
            delete User.all[uid]

            await s(uid, `${u.first_name}, удалили вашего перса из БД`)
            await TG.sr(uid, `${u.first_name}, Нажмите /start чтобы начать заново`)
            return true
        }

        const admins = Config.ADMIN_UIDS

        if (admins.indexOf(uid) == -1) {
            return false
        }

        if (t === "tt") {
            await TG.s(
                uid,
                "Test",
                Util.getOneTimeKeyboard([["AAA", "BBB", "CCC"], ["DDD", "EEE"], ["FFF"]])
            )
            return true
        }

        if (t === "/zero") {
            // await Zero.placeToRoot(ctx.u)
            u.m = `In debug`
            return true
        }

        if (t.startsWith("/add_")) {
            const item_id = parseInt(t.split("_")[1])

            const item = Items.all[item_id]
            if (!item) {
                await send(u, `Нет предмета с item_id=${item_id}`)
                return true
            }

            let qty = parseInt(t.split("_")[2])

            if (!qty) {
                qty = 1
            }

            User.addItem(u, item_id, qty)
            await TG.s(uid, `Добавлено: +${qty} ${Items.all[item_id].name}`)
            return true
        }

        return false
    }
}
