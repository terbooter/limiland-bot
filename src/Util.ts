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
}
