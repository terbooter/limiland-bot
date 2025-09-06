import {Input, Telegraf} from "telegraf"
import {LContext} from "./server"
import {DB} from "./DB"
import {logDate} from "./functions"
import {Util} from "./Util"
import {UserData} from "./UserData"
import {access} from "fs/promises"
import {constants} from "node:fs"

export async function s(uid: number, text: string, keyboard?: any): Promise<number> {
    return await TG.s(uid, text, keyboard)
}

// file format sample "npc/jester_1.jpg"
export async function send(
    uid: number | UserData,
    text: string,
    buttons: string[][] | undefined = undefined,
    file?: string
): Promise<number> {
    let real_uid
    if (Number.isInteger(uid)) {
        real_uid = uid
    } else {
        real_uid = (uid as unknown as UserData).uid
    }

    if (file) {
        await sendPhoto(real_uid, text, file, buttons)
    } else {
        return await TG.send(real_uid, text, buttons)
    }

    return 0
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

export async function sendPhoto(
    uid: number,
    message: string,
    file: string = "npc/jester_1.jpg",
    buttons?: string[][]
) {
    let path = `./src/files/img/`

    try {
        let a = await access(path + file, constants.F_OK)
    } catch (err) {
        //file not exists
        file = `no_file.jpg`
    }

    let sql = `SELECT * FROM img WHERE file_name=$1`
    let {rows} = await DB.query(sql, [file])
    let row = rows[0]

    const extra: {caption: string; parse_mode: string; reply_markup?: any} = {
        caption: message,
        parse_mode: "HTML"
        // reply_markup: Util.getKeyboard(buttons).reply_markup
    }

    if (buttons) {
        extra.reply_markup = Util.getKeyboard(buttons).reply_markup
    }

    if (row) {
        let file_id = row.file_id
        // @ts-ignore
        let r = await TG.bot.telegram.sendPhoto(uid, file_id, extra)
    } else {
        const inp = Input.fromLocalFile(path + file)
        // @ts-ignore
        let r = await TG.bot.telegram.sendPhoto(uid, inp, extra)

        if (r.photo && r.photo[0] && r.photo[0].file_id) {
            const file_id = r.photo[0].file_id

            sql = `INSERT INTO img (file_name, file_id, data)
                            VALUES ($1, $2, $3)`

            await DB.query(sql, [file, file_id, JSON.stringify(r)])
        } else {
            console.log(`ERROR: uid=${uid} can not load file ${path + file}`)
            console.log(JSON.stringify(r))
        }
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
