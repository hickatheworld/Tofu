import { Message } from "discord.js";
import { promises as fs } from "fs";
import { join } from "path";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "topic",
			desc: "Asks a question",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> {
		const questions: string[] = (await fs.readFile(join(__dirname, "../../../assets/txt/topic_questions.txt"), "utf-8")).split("\n");
		this.props.set("questions", questions);
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			const question: string = this.props.get("questions")[Math.floor(Math.random() * this.props.get("questions").length)];
			message.channel.send(question);
		});
	}

}