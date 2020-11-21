import { Message, MessageEmbed } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "embed",
			desc: "Makes the bot send an embed",
			module: "Tofu",
			usages: [
				"<options: Object>"
			],
			perms: ["MANAGE_MESSAGES"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			try {
				const options: Object = JSON.parse(args.join(" "));
				const embed: MessageEmbed = new MessageEmbed(options);
				message.channel.send(embed);
			} catch (err) {
				this.error("An error occured", message.channel, err);
			}
		});
	}
}