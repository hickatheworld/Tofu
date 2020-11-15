import { GuildMember, Message, MessageEmbed, ReactionCollector } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
import { formatDuration } from "../core/lib/Time";
import GuildWelcome from "../core/typedefs/GuildWelcome";
import { replaceWelcomeVariables } from "../core/lib/utils";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "guildMemberAdd");
	}

	public async exe(member: GuildMember) {
		const welcome: GuildWelcome = await this.client.db.getWelcome(member.guild);
		if (welcome.enabled) {
			if (welcome.type === "embed") {
				const embed: object = replaceWelcomeVariables(welcome.value as Object, member.user, member.guild, true);
				welcome.channel.send(new MessageEmbed(embed));
			} else {
				const msg: string = (replaceWelcomeVariables(welcome.value as Object, member.user, member.guild, false) as any).message;
				welcome.channel.send(msg);
			}
		}
		if (welcome.logs) {
			const accAge: string = formatDuration(new Date(), member.user.createdAt, true);
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`${member.user.tag} (${member.user.id})`)
				.setDescription(`${member.user.toString()} joined.`)
				.setThumbnail(member.user.avatarURL({ dynamic: true }) || member.user.defaultAvatarURL)
				.addField("Created at", member.user.createdAt.toUTCString(), true)
				.addField("Account age", accAge, true)
				.setFooter(`Click the reaction to get whois card for this member | ${member.guild.memberCount}th member`, "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/keycap-asterisk_2a-fe0f-20e3.png")
				.setColor("GREEN")
				.setTimestamp(new Date());
			const msg: Message = await welcome.logChannel.send(`\`${member.id}\``, { embed: embed });
			await msg.react("*️⃣");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, u) => {
				reaction.users.remove(u);
				if (reaction.emoji.name === "*️⃣") {
					collector.stop("");
					embed.setFooter(`${member.guild.memberCount}th member`);
					msg.edit(embed);
					const whois: MessageEmbed = this.client.commands.get("whois").generateEmbed(member);
					msg.channel.send(whois);
				}
			});
			collector.on("end", (_collected, _reason) => {
				msg.reactions.removeAll();
			});
		}
	}
}	