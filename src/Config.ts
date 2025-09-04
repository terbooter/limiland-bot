require("dotenv").config()

const dev = process.env.NODE_ENV === "dev"

export class Config {
    // static SKIP_INTRO = dev ? true : false
    static ENERGY_REGENERATION_SPEED = dev ? 1 / 60_000 : 1 / 60_000 // unit per ms
    static AP_DELAY = dev ? 1_000 : 3_000 // ms
    static ADMIN_UIDS = dev
        ? process.env.ADMIN_UIDS!.split(",").map(parseInt)
        : process.env.ADMIN_UIDS!.split(",").map(parseInt)
    static DEV = dev ? true : false
    static INTRO_CHIPS = dev ? 5 : 5
    static INTRO_LIMI = dev ? 2 : 2
    static INTRO_STRENGTH = dev ? 5 : 5
    static INTRO_MAX_HP = dev ? 5 : 5
    static INTRO_MAX_AP = dev ? 30 : 30
    static INTRO_ARMOR = dev ? 0 : 0
    static BAG_SIZE = dev ? 6 : 6
    static MEDICINE_BAG_SIZE = dev ? 3 : 3
    static WALK_TIME = dev ? 0.001 : 0.15
    static IDLE_GOLD_TIME = dev ? 10 : 60 * 6
    static RAID_CHANNEL_ID = dev ? -100 : -100
    static FREEZE_TIME = dev ? 3_600_000 * 12 : 3_600_000 * 12
    static CELL_MAX_MOBS = dev ? 5 : 5
    static DREAM_TIME = dev ? 0.5 * 60_000 : 8 * 60 * 60_000
    static CONCENTRATOR_TIME = dev ? 0.4 * 60_000 : 8 * 60 * 60_000
    static FRACTION_BANK_TIME = dev ? "16-07" : "21-40"
    static MAIN_CHAT_ID = dev ? -100 : -100
    static SLEEP_DELAY = dev ? 29 * 60_000 : 29 * 60_000
    static TALK_DELAY = dev ? 15_000 : 15_000
}
