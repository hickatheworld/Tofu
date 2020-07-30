import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { parseMember } from "../../core/lib/Args";
import GuildModerationSettings from "../../core/typedefs/GuildModerationSettings";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "kick",
			desc: "Kicks a user from the guild",
			usages: [
				"<member: User> [reason: String]"
			],
			module: "Moderation",
			perms: ["KICK_MEMBERS"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const kicked: GuildMember = parseMember(args.shift(), message.guild);
			if (!kicked) {
				message.channel.send("❌ Please mention a correct user.");
				return;
			}
			if (kicked.roles.highest.position > message.member.roles.highest.position) {
				message.channel.send("❌ You can't kick this member, they have a higher role as you.");
				return;
			}
			if (!kicked.kickable) {
				message.channel.send("❌ I cannot kick this member.");
				return;
			}
			const reason: string = args.join(" ").trim();
			this.client.db.kick(message.guild, message.author, kicked.user, reason || "No reason provided");
			message.channel.send(`**👢 Kicked ${kicked.user.tag}**`);
			const modSettings: GuildModerationSettings = await this.client.db.getModerationSettings(message.guild);
			if (modSettings.modLogsEnabled) {
				const channel: TextChannel = modSettings.modLogsChannel;
				const embed: MessageEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }))
				.setDescription(`👢 **Kicked ${kicked.user.tag}** (${kicked.user.id})\n**Reason** : ${reason || "No reason provided"}`)
				.setThumbnail(kicked.user.avatarURL({ dynamic: true }))
				.setColor("ORANGE");
				channel.send(embed);
			}
			if (modSettings.enableDM) {
					const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setDescription(`👢 __You have been kicked__\n**Actioned by:** ${message.author.tag}\n**Reason:** ${reason || "No reason provided"}`)
					.setColor("ORANGE")
					.setTimestamp(new Date());
					kicked.user.send(embed).catch((_error) => false);
			}
			kicked.kick(`${message.author.tag} — ${reason || "No reason provided"}`);
			return;
		});
	}
}