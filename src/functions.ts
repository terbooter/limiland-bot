export function logDate(): string {
    const date = `[ ${new Date().toISOString().replace(/T|Z/g, " ")}]`
    return date
}
