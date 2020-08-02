import { Message, GuildMember, TextChannel, MessageEmbed, Guild, Snowflake, User } from "discord.js";
import { QueryTypes } from "sequelize";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import Punishment from "../../core/typedefs/Punishment";
import GuildModerationSettings from "../../core/typedefs/GuildModerationSettings";
import { parseDuration, parseID, userMention } from "../../core/lib/Args";
import { formatDuration } from "../../core/lib/Time";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "ban",
			desc: "Throws the ban hammer.",
			usages: [
				"<member: User> [duration: Duration] [reason: String]",
				"<member: User> [reason: String]"
			],
			module: "Moderation",
			perms: ["BAN_MEMBERS"]
		});
	}

	public async setup(): Promise<void> {
		try {
			const bans: any = await this.client.db.query("SELECT ID,GUILD,TARGET,END FROM PUNISHMENTS WHERE TYPE='BAN' AND END IS NOT NULL AND CLOSED IS NOT TRUE", { type: QueryTypes.SELECT });
			for (const ban of bans) {
				const timeout: number = new Date(ban.end).getTime() - Date.now();
				setTimeout(() => {
					this.client.unban(ban.guild, ban.target, this.client.user, "Ban duration expired", ban.id);
				}, timeout);
			}
		} catch (err) {
			log.error(`Couldn't retrieve bans from database.\n${err.toString()}`);
		}
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const bannedID: Snowflake = parseID(args.shift(), userMention);
			if (!bannedID) {
				message.channel.send("❌ Please mention a correct user.");
				return;
			}
			const banned: GuildMember = message.guild.members.cache.get(bannedID);
			var duration: number = -1;
			var reason: string = "No reason provided";
			if (banned && banned.roles.highest.position >= message.member.roles.highest.position) {
				message.channel.send("❌ You can't ban this member, your role isn't high enough.");
				return;
			}
			if (banned && !banned.bannable) {
				message.channel.send("❌ I can't ban this member.");
				return;
			}
			if (args[0]) duration = parseDuration(args[0]);
			if (duration) args.shift();
			reason = args.join(" ").trim() || "No reason provided";

			var end: Date = null;
			var displayDuration: string = null;
			if (duration > 0) {
				end = new Date(Date.now() + duration);
				displayDuration = formatDuration(new Date(), end);
			}
			this.client.db.ban(message.guild, message.author, (banned) ? banned.user : bannedID, end, reason);
			const modSettings: GuildModerationSettings = await this.client.db.getModerationSettings(message.guild);
			if (modSettings.enableDM && banned) {
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setDescription(`🔨 __You have been banned__\n**Actioned by:** ${message.author.tag}\n**Reason:** ${reason}\n**Duration**: ${displayDuration || "Permanent"}`)
					.setColor("RED")
					.setTimestamp(new Date());
				banned.user.send(embed).catch((_error) => false);
			}
			var user: User = null;
			if (banned) user = (await banned.ban({ reason: `${message.author.tag} — ${reason}` })).user;
			else {
				var res: any = await message.guild.members.ban(bannedID, { reason: `${message.author.tag} — ${reason}` });
				if (res instanceof GuildMember) user = res.user;
				else if (res instanceof User) user = res;
			}
			if (modSettings.modLogsEnabled) {
				const channel: TextChannel = modSettings.modLogsChannel;
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }))
					.setDescription(`🔨 **Banned ${user.tag}** (${user.id})\n**Reason** : ${reason}`)
					.setFooter(`Duration : ${displayDuration || "Permanent"}`)
					.setThumbnail(user.avatarURL({ dynamic: true }))
					.setColor("RED");
				channel.send(embed);
			}
			message.channel.send(`🔨 **Banned <@${(banned) ? banned.user.id : bannedID}> ${displayDuration ? `for \`${displayDuration}\`` : "permanently"}**`);
			const punishment: Punishment = await this.client.db.ban(message.guild, message.author, (banned) ? banned.user : bannedID, end, reason);
			if (duration > 0) {
				setTimeout(() => {
					this.client.unban(message.guild.id, (banned) ? banned.user.id : bannedID, this.client.user, "Ban duration expired", punishment.id);
				}, duration);
			}
		});
	}
}