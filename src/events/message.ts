import { BotEvent } from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import { Message } from "discord.js";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "message", false);
	}

	public exe(message: Message): void {
		if (this.client.test && !this.client.admins.has(message.author.id)) return;
		const prefix = this.client.prefix;
		const msg = message.content;
		if (message.author.bot) return;
		if (!msg.toLowerCase().startsWith(prefix)) return;
		const args = msg.trim().slice(prefix.length).split(" ");
		const command = args.shift().toLowerCase();
		if (this.client.aliases.has(command)) {
			this.client.commands.get(this.client.aliases.get(command)).exe(message, args);
			return;
		}
		if (this.client.commands.has(command)) {
			this.client.commands.get(command).exe(message, args);
		}
	}
}