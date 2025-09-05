import {Mob} from "./MOB"

export type UserData = {
    uid: number
    short_uid: string

    level: number
    max_level: number

    first_name: string
    last_name?: string
    username?: string
    old_username?: string

    hp: number
    ap: number

    vitality: number
    strength: number
    intellect: number
    dexterity: number

    role?: "leader"

    head?: any
    hand_1?: any
    hand_2?: any
    body?: any
    legs?: any
    feet?: any

    chips: number
    losable_chips: number
    limi: number
    place: IntroPlace | ZeroPlace | ZonePlace | TimerPlace | MobPlace | TalkPlace

    rand: {
        main: number
        talk: number
    }

    m?: string
}

export type Place = IntroPlace | ZeroPlace | ZonePlace | TimerPlace

export type IntroPlace = {
    name: "intro"
    step: number
}

export type ZeroPlace = {
    name: "zero"
}

export type ZonePlace = {
    name: "zone"
}

export type MobPlace = {
    name: "mob"
    mob: Mob
    round: number
    m?: string
    boost: number
    boost_count: number
    win_place: TimerPlace | ZonePlace
    loose_place: TimerPlace | ZeroPlace
}

export type TalkPlace = {
    name: "talk"
    img?: string
    text: string
    line1: PlaceButton[]
    line2?: PlaceButton[]
    line3?: PlaceButton[]
}

export type PlaceButton = {
    label: string
    actions: string[]
    target: {
        saga: string
        id: string
    }
}

export type TimerPlace = {
    name: "timer"
    description: string
    target_place: ZonePlace | ZeroPlace | MobPlace
    startedAt: number
    beginExecutionAt?: number
    scheduledAt: number
}
