import {CronJob} from "cron"
import {DB, query} from "./DB"

const jobHourly = new CronJob(
    "0 0 0-23 * * *", // cronTime
    async function () {
        console.log("You will see this message every HOUR")
        console.log(new Date())

        await query(`update counters
                             set hourly_value=0;`)

        // await Game.changeBattleButton()
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Moscow" // timeZone
)

const jobDaily = new CronJob(
    "0 0 0 * * *", // cronTime
    async function () {
        console.log("You will see this message every DAY")
        console.log(new Date())

        // await Top.giveDailyReward()

        await query(`update counters
                             set daily_value_2=daily_value_1;`)

        await query(`update counters
                             set daily_value_1=daily_value;`)

        await query(`update counters
                             set daily_value=0;`)
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Moscow" // timeZone
)

const jobDaily10AM = new CronJob(
    "0 0 10 * * *", // cronTime
    async function () {
        console.log("You will see this message every DAY 10AM")
        console.log(new Date())
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Moscow" // timeZone
)

const jobWeekly = new CronJob(
    "59 59 23 * * SUN", // cronTime
    async function () {
        console.log("You will see this message every WEEK")
        console.log(new Date())
        await query(`update counters
                             set weekly_value=0;`)
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Moscow" // timeZone
)

const jobMonthly = new CronJob(
    "0 0 0 1 * *", // cronTime
    async function () {
        console.log("You will see this message every MONTH")
        console.log(new Date())

        await query(`update counters
                             set monthly_value=0;`)
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Moscow" // timeZone
)
