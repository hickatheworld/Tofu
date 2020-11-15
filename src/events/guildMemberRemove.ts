import OCBot from "../core/base/Client";
import BotEvent from "../core/base/BotEvent";
import * as log from "../core/lib/Log";
import { GuildMember, MessageEmbed } from "discord.js";
import { formatDuration } from "../core/lib/Time";
import GuildBye from "../core/typedefs/GuildBye";
import { replaceWelcomeVariables } from "../core/lib/utils";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "guildMemberRemove");
	}

	public async exe(member: GuildMember) {
		const bye: GuildBye = await this.client.db.getBye(member.guild);
		if (bye.enabled) {
			if (bye.type === "embed") {
				const embed: object = replaceWelcomeVariables(bye.value as Object, member.user, member.guild, true);
				bye.channel.send(new MessageEmbed(embed));
			} else {
				const msg: string = (replaceWelcomeVariables(bye.value as Object, member.user, member.guild, false) as any).message;
				bye.channel.send(msg);
			}
		}
		if (bye.logs) {
			const accAge: string = formatDuration(new Date(), member.user.createdAt, true);
			const joinAge: string = (member.joinedAt) ? formatDuration(new Date(), member.joinedAt, true) : "**Can't find duration**";
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`${member.user.tag} (${member.user.id})`)
				.setDescription(`${member.user.toString()} left.`)
				.setThumbnail(member.user.avatarURL({ dynamic: true }) || member.user.defaultAvatarURL)
				.addField("Account age", accAge, true)
				.addField("Join age", joinAge, true)
				.setFooter(`${member.guild.memberCount} members`)
				.setColor("RED")
				.setTimestamp(new Date());
			bye.logChannel.send(embed);
		}
	}
}	