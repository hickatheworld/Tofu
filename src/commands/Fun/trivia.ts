import { Message } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "trivia",
			desc: "Gets you a trivia question. Powered by [Open Trivia Database](https://opentdb.com/)",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const question: any = await (fetch("https://opentdb.com/api.php?amount=1").then(res => res.json()));
			message.channel.send(question.results[0].question);
			setTimeout(() => {
				message.channel.send(`Answer was : **${question.results[0].correct_answer.replace("&quot;","\"")}**`);
			}, 10000);
		});
	}
}