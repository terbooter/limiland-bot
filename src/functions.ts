export function logDate(): string {
    const date = `[ ${new Date().toISOString().replace(/T|Z/g, " ")}]`
    return date
}

export function r100(chanceInPercents: number): boolean {
    if (getRandomFloat(0, 100) <= chanceInPercents) {
        return true
    }
    return false
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min
}

export function getRandomItem<T extends any>(arr: T[]): T {
    return arr[getRandomInt(0, arr.length - 1)]
}
