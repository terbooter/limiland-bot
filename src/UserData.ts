export type UserData = {
    uid: number
    short_uid: string

    first_name: string
    last_name?: string
    username?: string
    old_username?: string

    hp: number
    max_hp: number
    mp: number
    max_mp: number

    vitality: number
    strength: number
    intellect: number

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
    place: any

    m?: string
}
