export type UserData = {
    uid: number
    short_uid: string

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
    place: IntroPlace | ZeroPlace | ZonePlace | TimerPlace

    m?: string
}

export type Place = {
    level: number
    timestamp: number
}

export type IntroPlace = {
    name: "intro"
    step: number
}

export type ZeroPlace = {
    name: "zero"
    last_level: number
}

export type ZonePlace = {
    name: "zone"
    level: number
}

export type MobPlace = {
    name: "mob"
    win_place: TimerPlace
    loose_place: TimerPlace
}

export type TimerPlace = {
    name: "timer"
    description: string
    target_place: ZonePlace
    startedAt: number
    beginExecutionAt?: number
    scheduledAt: number
}
