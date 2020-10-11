import { GuildEmoji, Message, MessageEmbed, ReactionCollector, Snowflake } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import { SERVER_INFOS_COLOR } from "../../core/lib/Constants";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "emotes",
			desc: "Lists all emotes from this server or gets image file of any emote.",
			module: "Server",
			usages: [
				"[emote: Emote]"
			],
			aliases: ["emote"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, async () => {
			const emoteRegex: RegExp = /<a?:.+:(\d+)>/i;
			const animatedRegex: RegExp = /<a:.+:(\d+)>/i;

			if (args.length !== 0 && emoteRegex.test(args[0])) {
				const id: Snowflake = emoteRegex.exec(args[0])[1];
				message.channel.send("https://cdn.discordapp.com/emojis/" + id + `${(animatedRegex.test(args[0]) ? ".gif" : ".png")}`);
				return;
			}
			const emotes: GuildEmoji[] = message.guild.emojis.cache.array().sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
			const total: number = emotes.length;
			const animated: number = message.guild.emojis.cache.filter(e => e.animated).array().length;
			const fixed: number = total - animated;
			const stats: string = `> **${total}** emotes : **${animated}** animated and **${fixed}** fixed.`;
			var embeds: MessageEmbed[] = [];
			for (var i = 0; i < emotes.length; i += 10) {
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle("Emotes list")
					.setDescription("Click on an emote to get its source file.\n\n")
					.setFooter(`Page ${i / 10 + 1}/${Math.ceil(emotes.length / 10)}`)
					.setColor(SERVER_INFOS_COLOR);
				embed.description += emotes.slice(i, i + 10).map(e => `[${e}](${e.url} "${e.name}")`).join(" ")
				embeds.push(embed);
			}
			const msg: Message = await message.channel.send(stats, embeds[0]);
			var currentPage: number = 0;
			await msg.react("⬅");
			await msg.react("➡");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, user) => {
				reaction.users.remove(user);
				if (user !== message.author) return;
				if (reaction.emoji.name === "⬅") {
					if (--currentPage < 0) currentPage = embeds.length - 1;
					msg.edit(stats, embeds[currentPage]);
				}
				if (reaction.emoji.name === "➡") {
					if (++currentPage == embeds.length) currentPage = 0;
					msg.edit(stats, embeds[currentPage]);
				}
			});
			collector.on("end", (_collected, _reason) => {
				msg.reactions.removeAll();
			});
		});
	}
}