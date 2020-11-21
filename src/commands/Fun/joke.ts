import { Message } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "joke",
			desc: "Gets you a joke. Powered by [Official Joke API](https://github.com/15Dkatz/official_joke_api)",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const joke: any = await (fetch("https://official-joke-api.appspot.com/random_joke").then(res => res.json()));
			message.channel.send(joke.setup);
			setTimeout(() => {
				message.channel.send(`**${joke.punchline}**`);
			}, 5000);
		});
	}
}