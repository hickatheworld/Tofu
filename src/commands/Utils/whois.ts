import { Message, User, EmbedField, MessageEmbed, GuildMember } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseMember, parseUser } from "../../core/lib/Args";
import { formatDuration } from "../../core/lib/Time";
import { formatFlag, formatPermission } from "../../core/lib/utils";


export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "whois",
			desc: "Get basic informations about a user",
			module: "Utils",
			usages: [
				"[user: User]"
			],
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, () => {
			var user: User;
			var member: GuildMember;
			if (parseUser(args[0], this.client)) {
				user = parseUser(args[0], this.client);
				member = parseMember(args[0], message.guild);
				if (!member) {
					message.channel.send("❌ User is not in this guild");
					return;
				}
			}
			else {
				user = message.author;
				member = message.member;
			}
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`${user.tag} (${user.id})`)
				.setColor(member.displayColor || "#AAAAAA")
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.addFields(
					[
						{
							name: "Badges",
							value: user.flags.toArray().map(i => formatFlag(i)).join(" ") || "No Badges",
							inline: true
						},
						{
							name: "Mention",
							value: user,
							inline: true
						},
						{
							name: "Avatar",
							value: "[Link](" + user.displayAvatarURL({ dynamic: true }) + ")",
							inline: true
						},
						{
							name: "Account creation",
							value: user.createdAt.toUTCString(),
							inline: false
						},
						{
							name: "Account age",
							value: formatDuration(new Date(), user.createdAt, true),
							inline: true
						},
						{
							name: "Join age",
							value: (member.joinedAt) ? formatDuration(new Date(), member.joinedAt, true) : "**Can't get join date**",
							inline: false
						},
						{
							name: "Join date",
							value: (member.joinedAt) ? member.joinedAt.toUTCString() : "**Can't get join date**",
							inline: true
						},
						{
							name: "Nickname",
							value: (member.nickname) ? member.nickname : "None",
							inline: true
						}
					]
				);
			if (member.premiumSince) {
				embed.addFields([
					{
						name: "Boosting age",
						value: formatDuration(new Date(), member.premiumSince),
						inline: false,
					},
					{
						name: "Boosting since",
						value: member.premiumSince.toUTCString(),
						inline: true
					}
				]);
			}
			embed.addFields([
				{
					name: "Highest role",
					value: member.roles.highest,
					inline: false
				},
				{
					name: "Color role",
					value: member.roles.color || "@everyone",
					inline: true
				},
				{
					name: "Hoisted role",
					value: member.roles.hoist || "@everyone",
					inline: true
				},
				{
					name: "Permisions",
					value: member.permissions.toArray().map(i => "`" + formatPermission(i) + "`").join(", ") || "None",
					inline: false
				}
			])
			message.channel.send("`" + user.id + "`", embed);
		});
	}
}