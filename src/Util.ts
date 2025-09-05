export class Util {
    static getKeyboard(buttons: string[][]) {
        const matrix: object[] = []

        for (let column = 0; column < buttons.length; column++) {
            matrix[column] = buttons[column].map((x) => {
                return {text: x}
            })
        }

        return {
            reply_markup: {
                keyboard: matrix,
                resize_keyboard: true
            }
        }
    }

    static getInlineKeyboard(buttons: {text: string; callback_data: string}[][]) {
        return {
            reply_markup: {
                inline_keyboard: buttons
            }
        }
    }

    static getOneTimeKeyboard(buttons: string[][]): object {
        const matrix: object[] = []

        for (let column = 0; column < buttons.length; column++) {
            matrix[column] = buttons[column].map((x) => {
                return {text: x}
            })
        }

        return {
            reply_markup: {
                keyboard: matrix,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        }
    }

    static getProgressBar(value: number, maxValue: number) {
        let percentage = Math.floor((value / maxValue) * 100)

        const full = "■"
        const empty = "□"
        let numberOfFull = Math.floor(percentage / 10)
        if (numberOfFull == 0 && value !== 0) {
            numberOfFull = 1
        }

        let r = ""
        for (let i = 0; i < 10; i++) {
            if (i < numberOfFull) {
                r += full
            } else {
                r += empty
            }
        }

        if (percentage === 0 && value > 0) {
            percentage = 1
        }

        return `${r} ${percentage}%`
    }
}
