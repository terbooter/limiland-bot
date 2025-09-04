import jwt from "jsonwebtoken"

export class JWTHelper {
    private static SECRET = process.env.JWT_SECRET!
    private static REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

    public static async verify(token, tokenType: "access" | "refresh"): Promise<JwtPayload> {
        console.log(`JWTHelper.verify ${token} ${tokenType}`)
        return new Promise<any>((resolve, reject) => {
            const secret = tokenType === "access" ? JWTHelper.SECRET : JWTHelper.REFRESH_SECRET

            jwt.verify(token, secret, (error, decoded) => {
                if (error) {
                    reject(error)
                    return
                }
                resolve(decoded)
            })
        })
    }

    public static sign(payload, tokenType: "access" | "refresh"): string {
        const secret = tokenType === "access" ? JWTHelper.SECRET : JWTHelper.REFRESH_SECRET
        return jwt.sign(payload, secret)
    }
}

export type JwtPayload = {
    sub: number // User ID
    username: string // Username
}
