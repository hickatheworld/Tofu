import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
import { yellow } from "chalk";
import { BotEvent } from "../core/base/BotEvent";
import { GuildMember, MessageEmbed } from "discord.js";
import { formatDuration } from "../core/lib/Time";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "guildMemberAdd", true);
	}

	public async exe(member: GuildMember) {
		log.info(`${log.user(member.user)} joined ${log.guild(member.guild)}`);
		const welcome = await this.client.db.getWelcome(member.guild);
		const replaceVariables = this.client.commands.get("welcome").funcs.get("replaceVariables");
		if (welcome.enabled) {
			if (welcome.type === "embed") {
				const embed = replaceVariables(welcome.value, member.user, member.guild, true);
				welcome.channel.send(new MessageEmbed(embed));
			} else {
				const msg = replaceVariables(welcome.value.message, member.user, member.guild, false);
				welcome.channel.send(msg);
			}
		}
		if (welcome.logs) {
			const accAge = formatDuration(new Date(), member.user.createdAt, true);
			const embed = new MessageEmbed()
				.setTitle(`${member.user.tag} (${member.user.id})`)
				.setDescription(`${member.user.toString()} joined.`)
				.setThumbnail(member.user.avatarURL({ dynamic: true }))
				.addField("Created at", member.user.createdAt.toUTCString(), true)
				.addField("Account age", accAge, true)
				.setFooter(`${member.guild.memberCount}th member`)
				.setColor("GREEN")
				.setTimestamp(new Date());
			welcome.logChannel.send(embed);
		}
	}
}	