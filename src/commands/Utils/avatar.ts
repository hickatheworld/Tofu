import { Message, User, EmbedField, MessageEmbed } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";


export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "avatar",
			desc: "The most complete avatar command you'll ever see.",
			module: "Utils",
			usages: [
				"[user: User]"
			],
			aliases: ["av","pfp"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, () => {
			var user: User;
			if (parseUser(args[0], this.client)) user = parseUser(args[0], this.client);
			else user = message.author;
			const baseUrl: string = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;
			const mainUrl: string = user.avatarURL({ dynamic: true, size: 4096 });
			const extensions: string[] = ["png", "jpg", "gif", "webp"];
			const sizes: number[] = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
			const fields: any = {};
			for (const ext of extensions) {
				fields[ext] = {
					name: `**.${ext}**`,
					value: "",
					inline: true
				};
				for (const size of sizes) {
					fields[ext].value+=`, [${size}](${baseUrl}.${ext}?size=${size})`;
				}
				fields[ext].value = fields[ext].value.slice(2);
			}
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`${user.username}'s avatar`)
				.setDescription(`Here is your avatar in all possible formats and sizes.\n[Main file](${mainUrl})`)
				.setImage(mainUrl)
				.addFields(Object.values(fields))
			message.channel.send(embed);
		});
	}

}