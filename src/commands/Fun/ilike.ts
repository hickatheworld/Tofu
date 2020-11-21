import { Message } from "discord.js";
import { promises as fs } from "fs";
import { join } from "path";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "ilike",
			desc: "I like [insert one of the 58 000 words in the list].\n**Trains are op.**",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> {
		const words: string[] = (await fs.readFile(join(__dirname, "../../../assets/txt/whatthe_words.txt"), "utf-8")).split("\n");
		this.props.set("words", words);
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			const word: string = this.props.get("words")[Math.floor(Math.random() * this.props.get("words").length)].replace("\r", "");
			message.channel.send(`I like **${word}**`);
			if (word === "trains") {
				this.client.db.setUser(message.author, "title", "🚄 **OP person**");
				message.channel.send("**TRAINS ARE OP**\nCheck your profile you won something.");
				log.info(`${log.user(message.author)} likes trains.`);
			}
		});
	}

}