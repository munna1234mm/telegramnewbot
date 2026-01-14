
const TELEGRAM_API = 'https://api.telegram.org/bot';

export class TelegramClient {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async call(method: string, payload: any) {
        try {
            const res = await fetch(`${TELEGRAM_API}${this.token}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error(`Telegram API Error [${method}]:`, e);
            throw e;
        }
    }

    async sendMessage(chatId: number | string, text: string, options: any = {}) {
        return this.call('sendMessage', {
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
            ...options
        });
    }

    async sendPhoto(chatId: number | string, photo: string, caption?: string) {
        return this.call('sendPhoto', {
            chat_id: chatId,
            photo,
            caption,
            parse_mode: 'Markdown'
        });
    }

    async answerCallbackQuery(callbackQueryId: string, text?: string) {
        return this.call('answerCallbackQuery', {
            callback_query_id: callbackQueryId,
            text
        });
    }

    async deleteMessage(chatId: number | string, messageId: number) {
        return this.call('deleteMessage', {
            chat_id: chatId,
            message_id: messageId
        });
    }
}
