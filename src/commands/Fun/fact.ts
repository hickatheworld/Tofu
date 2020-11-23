import { Message } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "fact",
			desc: "Gives you a random fact, what else?",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			try {
			const res = await (fetch("https://uselessfacts.jsph.pl/random.json?language=en").then(res => res.json()));
			message.channel.send(res.text);
			} catch (err) {
				this.error("An error occured, please try again later.", message.channel);
			}
		});
	}
}