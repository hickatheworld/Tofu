import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { promises as fs } from "fs";
import { join } from "path";
import { Message } from "discord.js";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "whatthe",
			desc: "What the [insert one of the 58 000 words in the list]. You have 0.0017% chance to get the F word!",
			module: "Fun"
		});
	}
	
	public async setup(): Promise<void> {
		const words: string[] = (await fs.readFile(join(__dirname, "../../../assets/txt/whatthe_words.txt"), "utf-8")).split("\n");
		this.props.set("words", words);
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			const word: string = this.props.get("words")[Math.floor(Math.random() * this.props.get("words").length)].replace("\r","");
			message.channel.send(`What the **${word}**`);
			if (word === "fuck") {
				message.channel.send("OMG! YOU GOT THE **F WORD**!\nReminder : You had **0.0017%** chance to get it, so congratulations!!");
			}
		});
	}

}