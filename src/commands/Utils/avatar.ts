import { Message, User, MessageEmbed, ReactionCollector } from "discord.js";
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
			aliases: ["av", "pfp"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, async () => {
			var user: User;
			if (parseUser(args[0], this.client)) user = parseUser(args[0], this.client);
			else user = message.author;
			const mainUrl: string = user.avatarURL({ dynamic: true, size: 4096 });
			if (!mainUrl) {
				const embed: MessageEmbed = new MessageEmbed()
					.setTitle("This user has no avatar")
					.setDescription(user.toString() + " has the default Discord avatar")
					.setColor("RED")
					.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }));
				message.channel.send(embed);
				return;
			}
			const tiny: MessageEmbed = new MessageEmbed()
				.setTitle(user.username + "'s avatar")
				.setImage(mainUrl)
				.setFooter("Click the reaction to get all files formats", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/keycap-asterisk_2a-fe0f-20e3.png");
			const msg: Message = await message.channel.send(tiny);
			await msg.react("*️⃣");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, u) => {
				reaction.users.remove(u);
				if (u !== message.author) return;
				if (reaction.emoji.name === "*️⃣") {
					collector.stop("");
					const baseUrl: string = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;
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
							fields[ext].value += `, [${size}](${baseUrl}.${ext}?size=${size})`;
						}
						fields[ext].value = fields[ext].value.slice(2);
					}
					const embed: MessageEmbed = new MessageEmbed()
						.setTitle(`${user.username}'s avatar`)
						.setDescription(`Here is your avatar in all possible formats and sizes.\n[Main file](${mainUrl})`)
						.setImage(mainUrl)
						.addFields(Object.values(fields))
					msg.delete();
					message.channel.send(embed);
				}
			});
			collector.on("end", (_collected, _reason) => {
				if (_reason !== "idle") return;
				msg.reactions.removeAll();
				tiny.setFooter("", "");
				msg.edit("`" + user.id + "`", tiny);
			});
		});
	}

}