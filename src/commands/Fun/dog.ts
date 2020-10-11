import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "dog",
			desc: "Gets you a lovely dog picture. Powered by [TheDogAPI](https://thedogapi.com)",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const dogs: Object[] = await (fetch("https://api.thedogapi.com/v1/images/search").then(res => res.json()));
			const dog: any = dogs[0];
			const embed: MessageEmbed = new MessageEmbed()
				.setColor("d99e82")
				.setTitle("Here's a dog")
				.setImage(dog.url)
				;
			message.channel.send(embed);
		});
	}
}