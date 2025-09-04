import {Telegraf} from "telegraf"
import {LContext} from "./server"
import {DB} from "./DB"
import {logDate} from "./functions"
import {Util} from "./Util"

export async function s(uid: number, text: string, keyboard?: any): Promise<number> {
    return await TG.s(uid, text, keyboard)
}

export async function send(uid: number, text: string, buttons?: string[][]): Promise<number> {
    return await TG.send(uid, text, buttons)
}

export class TG {
    static bot: Telegraf<LContext>

    static init(bot: Telegraf<LContext>) {
        TG.bot = bot
    }

    static async si(
        uid: number,
        text: string,
        keyboard: {
            text: string
            callback_data: string
        }[][]
    ): Promise<number> {
        const k = {
            reply_markup: {
                inline_keyboard: keyboard,
                resize_keyboard: false
            },
            parse_mode: "HTML"
        }
        return await TG.s(uid, text, k)
    }

    static async send(uid: number, text: string, buttons?: string[][]): Promise<number> {
        let keyboard
        if (buttons) {
            keyboard = Util.getKeyboard(buttons)
        }
        try {
            let r = await TG.bot.telegram.sendMessage(uid, text, {
                ...keyboard,
                parse_mode: "HTML",
                disable_web_page_preview: true
            })

            console.log("\n<<<<<", uid)
            console.log(
                `${logDate()} uid=${uid} text=${text.substring(0, 25)} keyboard=${JSON.stringify(keyboard)}`
            )
            console.log(`${logDate()} r=${JSON.stringify(r)}`)
            console.log("=====\n")

            return r.message_id
        } catch (err) {
            // console.log(JSON.stringify(err))
            // @ts-ignore
            // console.log(err.code)
            // @ts-ignore
            // console.log(err.message)

            // @ts-ignore
            const response = err.response
            if (
                response &&
                response.error_code == 403 &&
                response.description === "Forbidden: bot was blocked by the user"
            ) {
                console.log("WARN: BOT WAS BLOCKED BY uid=" + uid)
                await DB.query(
                    `UPDATE users set tg_blocked_at=now() where uid=$1 AND tg_blocked_at is null`,
                    [uid]
                )
            } else {
                console.log(`${logDate()} ERROR: uid=${uid} TELEGRAM ERROR: ${err}`)
            }
        }
        return 0
    }

    static async s(uid: number, text: string, keyboard?: any): Promise<number> {
        try {
            let r = await TG.bot.telegram.sendMessage(uid, text, {
                ...keyboard,
                parse_mode: "HTML",
                disable_web_page_preview: true
            })

            console.log("\n<<<<<", uid)
            console.log(
                `${logDate()} uid=${uid} text=${text.substring(0, 25)} keyboard=${JSON.stringify(keyboard)}`
            )
            console.log(`${logDate()} r=${JSON.stringify(r)}`)
            console.log("=====\n")

            return r.message_id
        } catch (err) {
            // console.log(JSON.stringify(err))
            // @ts-ignore
            // console.log(err.code)
            // @ts-ignore
            // console.log(err.message)

            // @ts-ignore
            const response = err.response
            if (
                response &&
                response.error_code == 403 &&
                response.description === "Forbidden: bot was blocked by the user"
            ) {
                console.log("WARN: BOT WAS BLOCKED BY uid=" + uid)
                await DB.query(
                    `UPDATE users set tg_blocked_at=now() where uid=$1 AND tg_blocked_at is null`,
                    [uid]
                )
            } else {
                console.log(`${logDate()} ERROR: uid=${uid} TELEGRAM ERROR: ${err}`)
            }
        }
        return 0
    }

    static async sr(uid: number, text: string, keyboard?: any) {
        await TG.bot.telegram.sendMessage(uid, text, {
            reply_markup: {
                remove_keyboard: true
            },
            parse_mode: "HTML"
        })
    }
}

// remove_keyboard

export type TG_User = {
    id: number
    is_bot: boolean
    first_name: string //"Dmitry"
    last_name?: string // "Zin"
    username?: string //"terboot"
    language_code?: string //"en"
}
