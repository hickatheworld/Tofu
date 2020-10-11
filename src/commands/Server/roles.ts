import { Message, MessageEmbed, ReactionCollector, Role } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import { parseRole } from "../../core/lib/Args";
import { SERVER_INFOS_COLOR } from "../../core/lib/Constants";
import { formatDuration } from "../../core/lib/Time";
import { formatPermission } from "../../core/lib/utils";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "roles",
			desc: "Lists all roles from this server or gets infos about a role.",
			module: "Server",
			usages: [
				"[role: Role]"
			],
			aliases: ["role"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, async () => {
			const role: Role = parseRole(args[0], message.guild);
			if (args[0] && !role) {
				this.error("Can't find role", message.channel);
				return;
			}
			if (role) {
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle(role.name)
					.setColor((role.hexColor === "#000000") ? "#EEEEEE" : (role.hexColor === "#ffffff") ? "#FFFFEE" : role.color)
					.setFooter(`Creation : ${role.createdAt.toUTCString()} (${formatDuration(new Date(), role.createdAt)})`)
					.addFields([
						{
							name: "ID",
							value: role.id,
							inline: true
						},
						{
							name: "Mention",
							value: role,
							inline: true
						},
						{
							name: "\u200B",
							value: "\u200B",
							inline: true
						},
						{
							name: "Position",
							value: `**${role.guild.roles.cache.array().length - role.position}**/${role.guild.roles.cache.array().length}`,
							inline: true
						},
						{
							name: "Hoisted",
							value: `${(role.hoist) ? "Yes" : "No"}`,
							inline: true
						},
						{
							name: "Mentionnable",
							value: `${(role.mentionable) ? "Yes" : "No"}`,
							inline: true
						},
						{
							name: "Color",
							value: `${(role.hexColor === "#000000") ? "None" : role.hexColor.toUpperCase()}`,
							inline: true
						},
						{
							name: "Members",
							value: `**${role.members.array().length}**/${role.guild.memberCount} (${(role.members.array().length / role.guild.memberCount * 100).toFixed(1)}%)`,
							inline: true
						},
						{
							name: "Permissions",
							value: role.permissions.toArray().map(i => "`" + formatPermission(i) + "`").join(", ") || "None",
							inline: false
						}
					]);
				message.channel.send(embed);
				return;
			}
			const roles: Role[] = message.guild.roles.cache.sort((a, b) => a.position - b.position).array();
			const total: number = roles.length;
			var embeds: MessageEmbed[] = [];
			for (var i = 0; i < roles.length; i += 20) {
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle("Roles list")
					.setDescription(`Get more infos about a role with \`${this.client.prefix}role <role>\`\n`)
					.setFooter(`Page ${i / 20 + 1}/${Math.ceil(roles.length / 20)}`)
					.setColor(SERVER_INFOS_COLOR);
				embed.description += roles.slice(i, i + 20).join(", ")
				embeds.push(embed);
			}
			const msg: Message = await message.channel.send(`> **${total}** roles`, embeds[0]);
			var currentPage: number = 0;
			await msg.react("⬅");
			await msg.react("➡");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, user) => {
				reaction.users.remove(user);
				if (user !== message.author) return;
				if (reaction.emoji.name === "⬅") {
					if (--currentPage < 0) currentPage = embeds.length - 1;
					msg.edit(`> **${total}** roles`, embeds[currentPage]);
				}
				if (reaction.emoji.name === "➡") {
					if (++currentPage == embeds.length) currentPage = 0;
					msg.edit(`> **${total}** roles`, embeds[currentPage]);
				}
			});
			collector.on("end", (_collected, _reason) => {
				msg.reactions.removeAll();
			});
		});
	}
}