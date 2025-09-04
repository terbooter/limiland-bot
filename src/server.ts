import {Context, Telegraf} from "telegraf"
import {UserData} from "./UserData"
import {s, TG, TG_User} from "./TG"
import {DB} from "./DB"
import {ExpressApp} from "./express/ExpressApp"
import {logDate} from "./functions"
import {User} from "./User"
import {message} from "telegraf/filters"
import {Admin} from "./Admin"
import {Intro} from "./places/Intro"
import {Game} from "./Game"
import {Zero} from "./places/Zero"
import {Zone} from "./places/Zone"
import {MOB} from "./MOB"

require("dotenv").config()

const requests: {[uid: number]: number} = {}

console.log("START SERVER")

const bot = new Telegraf<LContext>(process.env.BOT_TOKEN as string)

async function main() {
    TG.init(bot)
    DB.connect()
    await User.load()

    const expressApp = new ExpressApp()

    const port = 8888
    expressApp.getApp().listen(port)

    bot.catch((err) => {
        console.log("BOT ERROR CATCH")
        console.log(err)
        // handle error
    })

    let r = await bot.telegram.setMyCommands([
        {command: "donate", description: "💎Поддержать"},
        {
            command: "help",
            description: "Справка"
        },

        {command: "bag", description: "Сумка"},
        {command: "food", description: "Еда"},
        {command: "me", description: "Я"},
        {command: "refresh", description: "Обновить"},
        {command: "rules", description: "❗Правила"}
        // {command: "rs", description: "❗Удалить Персонаж"}
    ])

    await bot.launch()
}

bot.use(async (ctx, next) => {
    console.time(`Processing update ${ctx.update.update_id}`)
    // console.log(ctx)
    let update = ctx.update as any
    console.log(`${logDate()} *** RAW MSG: ${JSON.stringify(update)}`)

    let from: TG_User = {
        id: 0,
        is_bot: false,
        first_name: ""
    }

    if (update.callback_query) {
        from = update.callback_query.from
        ctx.uid = update.callback_query.from.id
        ctx.t = update.callback_query.data
        ctx.buttonText = update.callback_query.message.reply_markup.inline_keyboard[0][0].text
    } else if (update.message) {
        ctx.uid = update.message.from.id
        from = update.message.from
        ctx.t = update.message.text
        ctx.buttonText = ""

        if (update.message.chat && update.message.chat.id < 0) {
            // await Chat.execute(ctx)
            return
        }
    } else if (update.my_chat_member) {
        from = update.my_chat_member.from

        console.log(`WARN: bot have been blocked by user`)
        console.dir(update, {depth: null})
        return
    } else {
        console.log(`ERROR: unsupported update message`)
        console.dir(update, {depth: null})
        return
    }

    console.log(`>>>>> uid=${from.id}`, ctx.t, ctx.buttonText)

    if (requests[ctx.uid] && Date.now() - requests[ctx.uid] < 500) {
        await TG.s(ctx.uid, `Слишком часто приходят запросы`)
        return
    }
    requests[ctx.uid] = Date.now()

    if (!User.all[ctx.uid]) {
        let u = User.createNew(from)

        User.all[ctx.uid] = u
        console.log(`User not found in DB. creating new u=${JSON.stringify(u)}`)
        await DB.saveUser(u)
    }

    ctx.u = User.all[ctx.uid]
    const u = ctx.u

    // Keep actual username for chat commands
    u.username = from.username

    await next() // runs next middleware

    if (ctx.u.m) {
        let r = await s(ctx.u.uid, ctx.u.m)
        delete ctx.u.m
    }
    await DB.saveUser(ctx.u)
    console.timeEnd(`Processing update ${ctx.update.update_id}`)
})

bot.on(message("text"), async (ctx) => {
    if (await Admin.exec(ctx)) {
        return
    }
    if (await Intro.exec(ctx)) {
        return
    }
    if (await Zero.exec(ctx)) {
        return
    }

    if (await User.exec(ctx)) {
        return
    }

    if (await Zone.exec(ctx)) {
        return
    }

    if (await MOB.exec(ctx)) {
        return
    }
})

bot.on("callback_query", async (ctx) => {
    console.log("callback_query")
    console.log(ctx.uid, ctx.t)

    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id)

    if (await Admin.exec(ctx)) {
        return
    }
    // if (await Intro.exec(ctx)) {
    //     return
    // }
})

main()
setInterval(checkTimers, 2000)

async function checkTimers() {
    for (let uid in User.all) {
        let u = User.all[uid]

        if (u.place.name !== "timer") {
            continue
        }

        console.log(u)

        const timer = u.place

        if (timer.scheduledAt < Date.now() && !timer.beginExecutionAt) {
            timer.beginExecutionAt = Date.now()

            u.place = timer.target_place
            await Game.draw(u)

            if (u.m) {
                let r = await TG.s(u.uid, u.m)
                delete u.m
            }

            await DB.saveUser(u, false)
        }
    }
}

export interface LContext extends Context {
    uid: number
    u: UserData
    t: string
    buttonText: string
}
