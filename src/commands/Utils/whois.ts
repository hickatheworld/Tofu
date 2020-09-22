import { Message, User, EmbedField, MessageEmbed, GuildMember, ReactionCollector } from "discord.js";
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
		//TODO: Find where an empty field value is set, causing the command to return nothing
		super.check(message, async () => {
			var user: User;
			var member: GuildMember;
			if (parseUser(args[0], this.client)) {
				user = parseUser(args[0], this.client);
				member = parseMember(args[0], message.guild);
				if (!member) {
					this.error("User is not in this guild", message.channel);
					return;
				}
			}
			else {
				user = message.author;
				member = message.member;
			}
			const tiny: MessageEmbed = new MessageEmbed()
				.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
				.setTitle(`Informations about ${member.displayName}`)
				.setColor(member.displayColor || "#AAAAAA")
				.setDescription(user)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.addFields([
					{
						name: "Account creation",
						value: user.createdAt.toUTCString(),
						inline: true
					},
					{
						name: "Join date",
						value: (member.joinedAt) ? member.joinedAt.toUTCString() : "**Can't get join date**",
						inline: true
					},
					{
						name: "Highest role",
						value: member.roles.highest,
						inline: false
					}
				])
				.setFooter("Click the reaction to get full informations", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/keycap-asterisk_2a-fe0f-20e3.png")
			const msg: Message = await message.channel.send("`" + user.id + "`", tiny);
			await msg.react("*️⃣");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 6000 });
			collector.on("collect", (reaction, user) => {
				reaction.users.remove(user);
				if (user !== message.author) return;
				if (reaction.emoji.name === "*️⃣") {
					collector.stop("");
					const embed: MessageEmbed = new MessageEmbed()
						.setTitle(`${user.tag} (${user.id})`)
						.setColor(member.displayColor || "#AAAAAA")
						.setThumbnail(user.displayAvatarURL({ dynamic: true }))
						.addFields(
							[
								{
									name: "Badges",
									value: (user.flags) ? user.flags.toArray().map(i => formatFlag(i)).join(" ") : "No Badges",
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
								value: (member.premiumSince) ? formatDuration(new Date(), member.premiumSince) : "**Can't get boosting age**",
								inline: false,
							},
							{
								name: "Boosting since",
								value: (member.premiumSince) ? member.premiumSince.toUTCString() : "**Can't get boosting age**",
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
					]);
					msg.delete();
					message.channel.send("`" + user.id + "`", embed);
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