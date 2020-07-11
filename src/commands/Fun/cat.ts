import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "cat",
			desc: "Gets you a lovely cat picture. Powered by TheCatAPI.com",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const cats: Object[] = await (fetch("https://api.thecatapi.com/v1/images/search").then(res => res.json()));
			const cat: any = cats[0];
			const embed: MessageEmbed = new MessageEmbed()
				.setColor("99aab5")
				.setTitle("Here's a cat")
				.setImage(cat.url)
			;
			message.channel.send(embed);
		});
	}
}