import {Mob} from "./MOB"

export type UserData = {
    uid: number
    short_uid: string

    level: number
    level_explore: number
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

    losable_chips: number
    place: IntroPlace | ZeroPlace | ZonePlace | TimerPlace | MobPlace | TalkPlace

    rand: {
        main: number
        talk: number
    }

    items: {[id: string]: number}

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
    win_place: TimerPlace | ZonePlace | TalkPlace
    loose_place: TimerPlace | ZeroPlace | TalkPlace
}

export type TalkPlace = {
    name: "talk"
    img?: string
    text: string
    line1: PlaceButton[]
    line2?: PlaceButton[]
    line3?: PlaceButton[]
}

export type PlaceTarget = {
    saga: string
    id: string
}

export type PlaceButton = {
    label: string
    actions: string[]
    next:
        | {
              type: "click"
              target: PlaceTarget
          }
        | {
              type: "mob"
              win_target: PlaceTarget
          }
        | {
              type: "timer"
              delay: number
              message: string
              target: PlaceTarget
          }
}

export type TimerPlace = {
    name: "timer"
    description: string
    target_place: ZonePlace | ZeroPlace | MobPlace | TalkPlace
    startedAt: number
    beginExecutionAt?: number
    scheduledAt: number
}
