import {createHmac} from "node:crypto"

export type WebAppInitData = {
    query_id?: string
    user: WebAppUser
    receiver?: WebAppUser
    chat_type?: "sender" | "private" | "group" | "supergroup" | "channel"
    chat_instance?: string
    start_param?: string
    auth_date: number
    hash: string
}

export type WebAppUser = {
    id: number
    is_bot?: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    photo_url?: true
}

export type StoneWebAppUser = WebAppUser & {type?: string; avatar_url?: string}

export class Auth {
    // https://github.com/feathers-studio/telegraf-docs/tree/673ad547190568183ce699e42dd3920c4804cbec/examples/mini-apps#validating-initdata
    static check(initData: string): WebAppInitData {
        const data = new URLSearchParams(initData)

        const data_check_string = getCheckString(data)

        const secret_key = HMAC_SHA256("WebAppData", process.env.TG_BOT_KEY!).digest()
        const hash = HMAC_SHA256(secret_key, data_check_string).digest("hex")

        if (hash !== data.get("hash")) {
            throw new Error("telegram hash not valid")
        }

        const userString = data.get("user")

        if (!userString) {
            throw new Error("telegram user not found in initData")
        }
        const user = JSON.parse(userString)

        const auth_date = data.get("auth_date")
        if (!auth_date) {
            throw new Error("telegram auth_date is null")
        }

        let start_param: string | undefined = undefined
        let start_param_string = data.get("start_param")
        if (start_param_string) {
            start_param = start_param_string
        }

        const webAppInitData: WebAppInitData = {
            auth_date: parseInt(auth_date),
            user,
            hash,
            start_param
        }

        return webAppInitData
    }
}

function HMAC_SHA256(key: string | Buffer, secret: string) {
    return createHmac("sha256", key).update(secret)
}

function getCheckString(data: URLSearchParams) {
    const items: [k: string, v: string][] = []

    // remove hash
    for (const [k, v] of data.entries()) if (k !== "hash") items.push([k, v])

    return items
        .sort(([a], [b]) => a.localeCompare(b)) // sort keys
        .map(([k, v]) => `${k}=${v}`) // combine key-value pairs
        .join("\n")
}
