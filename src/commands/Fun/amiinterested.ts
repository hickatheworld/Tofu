import { Message } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "amiinterested",
			desc: "*Use this command to make someone understand you're lowkey not interested..*",
			module: "Fun",
			aliases: ["interest", "doicare"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const msg: Message = await message.channel.send("Calculating interest...");
			setTimeout(async () => {
				await msg.delete();
				message.channel.send(`${message.author.toString()}, you are **0%** interested.`)
			}, 1500);
		});
	}
}