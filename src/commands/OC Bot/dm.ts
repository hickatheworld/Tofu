import { Message, MessageEmbed, TextChannel, User } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "dm",
			desc: "Sends a dm to someone (Admin only)",
			module: "OC Bot",
			usages: [
				"dm <user: User> <message: String> [attachments: Attachment[]]"
			],
			whitelist: client.admins
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const user: User = parseUser(args.shift(), this.client);
			if (!user) {
				this.error("Can't find user.", message.channel);
				return;
			}
			const content: string = args.join(" ");
			if (!content.replace(" ", "") && !message.attachments.size) {
				this.error("Can't send an empty message", message.channel);
				return;
			}
			try {
				const msg: Message = await user.send(content, {
					files: message.attachments.map(a => a.url)
				});
				log.info(`${log.user(message.author)} sent a DM to ${log.user(user)} : ${log.text(content)}`);
				const channel: TextChannel = await this.client.channels.fetch(process.env.DM_CHANNEL) as TextChannel || null;
				try {
					const embed: MessageEmbed = new MessageEmbed()
						.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }))
						.setColor("YELLOW")
						.setDescription(msg.content)
						.setFooter(`To ${user.tag} (${user.id})`, user.avatarURL({ dynamic: true }))
						.setTimestamp(msg.createdAt);
					if (msg.attachments.size > 0) embed.setImage(msg.attachments.first().url)
					if (msg.attachments.size > 1) embed.addField("Attachments", msg.attachments.map(a => `[Link](${a.url})`).join("\n"))
					channel.send(embed);
				} catch (err) {
					log.error(`An error occured trying to mirror sent DM. (ID: ${message.id})`);
					console.log(err);
				}
			} catch (err) {
				this.error("An error occured", message.channel, err);
			}		
		});
	}
}