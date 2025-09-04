import * as pg from "pg"
import {Pool, QueryConfigValues, QueryResultRow} from "pg"
import {UserData} from "./UserData"

export async function query<R extends QueryResultRow = any, I = any[]>(
    queryText: string,
    values?: QueryConfigValues<I>
) {
    return await DB.pool.query(queryText, values)
}

export class DB {
    static pool: Pool

    static connect() {
        const {Pool} = pg

        let types = pg.types
        types.setTypeParser(1114, function (stringValue) {
            return new Date(stringValue + "+0000")
        })

        const DB_USER = process.env.DB_USER ? process.env.DB_USER : "postgres"

        const pool = new Pool({
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            user: DB_USER,
            database: process.env.DB_NAME,
            port: 5432,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        })

        DB.pool = pool
    }

    static async query<R extends QueryResultRow = any, I = any[]>(
        queryText: string,
        values?: QueryConfigValues<I>
    ) {
        return await DB.pool.query(queryText, values)
    }

    static async saveObject(
        uid: number,
        name: string,
        obj: any,
        doLog: boolean = false
    ): Promise<void> {
        const sql = `
            INSERT INTO objects (uid, name, data)
            VALUES (${parseInt(uid as any)}, $1, $2) ON CONFLICT (uid, name) DO
            UPDATE SET data = $3, updated_at = now()
                RETURNING *`

        if (doLog) {
            console.log(`uid=${uid}`)
            console.log(sql)
        }

        let r = await DB.pool.query(sql, [name, obj, obj])
    }

    static async loadObject<T extends any>(uid: number, name: string): Promise<T> {
        const sql = `SELECT *
                     FROM objects
                     WHERE uid = $1
                       AND name = $2`
        let {rows} = await DB.query(sql, [uid, name])
        const row = rows[0]
        if (!row) {
            return {} as any
        }
        if (!row.data) {
            return {} as any
        }
        return row.data
    }

    static async saveUser(u: UserData, doLog: boolean = false): Promise<void> {
        if (!u) {
            return
        }
        const sql = `
            INSERT INTO users (uid, data)
            VALUES (${parseInt(u.uid as any)}, $1) ON CONFLICT (uid ) DO
            UPDATE SET data = $2, updated_at = now()
                RETURNING *`

        if (doLog) {
            console.log(`uid=${u.uid}`)
            console.log(sql)
        }
        try {
            let r = await DB.pool.query(sql, [u, u])
        } catch (err) {
            //  severity: 'ERROR',
            //   code: '22P02',
            //   detail: 'Unicode low surrogate must follow a high surrogate.',
            console.log(`ERROR: save user uid=${u.uid} ` + JSON.stringify(err))
            // @ts-ignore
            console.log(err.code)
            // @ts-ignore
            if (err.code === "22P02") {
                u.first_name = u.username ? u.username : "my_name_here"
                await DB.pool.query(sql, [u, u])
            }
        }
    }

    static async saveUserNoUpdateTime(u: UserData, doLog: boolean = false): Promise<void> {
        if (!u) {
            return
        }
        let str = JSON.stringify(u)
        const sql = `
            INSERT INTO users (uid, data)
            VALUES (${parseInt(u.uid as any)}, '${str}') ON CONFLICT (uid ) DO
            UPDATE SET data = '${str}'
                RETURNING *`

        if (doLog) {
            console.log(`uid=${u.uid}`)
            console.log(sql)
        }
        let r = await DB.pool.query(sql)
    }

    static async getCounter(
        uid: number,
        name: CounterName,
        value: ValueName = "value"
    ): Promise<number> {
        const sql = `
            SELECT uid, counters.${value} as value
            FROM counters
            WHERE name = $1
              AND uid = $2
            order by value DESC
                limit 10;`

        let r = await DB.pool.query(sql, [name, uid])

        const rows = r.rows

        if (r.rows.length > 0) {
            return r.rows[0].value
        }

        return 0
    }

    static async insertAction(uid: number, target_uid: number, name: string, data: any) {
        let str = JSON.stringify(data)
        const sql = `
            insert into actions (uid, target_uid, name, data)
            VALUES ($1, $2, $3, '${str}');`
        await DB.query(sql, [uid, target_uid, name])
    }

    static async updateCounter(uid: number, name: CounterName, value: number = 1): Promise<number> {
        uid = parseInt(uid as any)
        value = parseInt(value as any)

        const sql = `
            INSERT INTO counters (uid, name, value, hourly_value, daily_value, weekly_value, monthly_value, updated_at)
            VALUES (${uid}, $1, ${value}, ${value}, ${value}, ${value}, ${value}, now()) ON CONFLICT (uid, name) DO
            UPDATE SET value = counters.value + ${value},
                hourly_value = counters.hourly_value + ${value},
                daily_value = counters.daily_value + ${value},
                weekly_value = counters.weekly_value + ${value},
                monthly_value = counters.monthly_value + ${value},
                updated_at=now()
                RETURNING value;
        `
        let r = await DB.pool.query(sql, [name])
        return r.rows[0].value
    }
}

export type CounterName = string
export type ValueName = "value" | "hourly_value" | "daily_value" | "monthly_value" | "weekly_value"
