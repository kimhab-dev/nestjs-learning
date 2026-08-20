import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    this.bot = new Telegraf(token);
  }

  async sendMessage(message: string) {
    const chatId = this.configService.getOrThrow<string>('TELEGRAM_CHAT_ID');

    await this.bot.telegram.sendMessage(chatId, message);
  }
}
