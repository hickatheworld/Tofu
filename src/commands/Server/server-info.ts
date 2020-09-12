import { Message, MessageEmbed, Guild, ReactionCollector } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { BLANK_EMOTE, DiscordServerIconsEmotes, SERVER_INFOS_COLOR, ServerInfosEmotes, ServerRegionsEmotes } from "../../core/lib/Constants";
import { formatDuration } from "../../core/lib/Time";
import { formatRegion } from "../../core/lib/utils";


export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "server-infos",
			desc: "Gets basic informations about this server",
			module: "Server",
			aliases: ["server", "server-info"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, async () => {
			var tier: keyof typeof DiscordServerIconsEmotes;
			var icon: string;
			const guild: Guild = await message.guild.fetch();
			if (!guild || !guild.available) {
				this.error("Couldn't access server infos.", message.channel);
				return;
			}
			tier = ((guild.premiumTier > 0) ? "BOOST_LEVEL_" + guild.premiumTier : "") as keyof typeof DiscordServerIconsEmotes;
			if (guild.partnered) tier = "PARTNER";
			if (guild.verified) tier = "VERIFIED";
			if (tier) {
				const emote: string = DiscordServerIconsEmotes[tier];
				icon = "https://cdn.discordapp.com/emojis/" + /<a?:.+:(\d+)>/i.exec(emote)[1] + ".png";
			} else {
				icon = guild.iconURL();
			}
			const num: Function = new Intl.NumberFormat("en-US").format;
			const online: number = num((await guild.fetchPreview()).approximatePresenceCount);
			const members: number = num(guild.memberCount);
			const texts: number = num(guild.channels.cache.filter(c => c.type == "text").array().length);
			const voices: number = num(guild.channels.cache.filter(c => c.type == "voice").array().length);
			const boosts: number = guild.premiumSubscriptionCount;
			const level: number = guild.premiumTier;
			const flag: ServerRegionsEmotes = (guild.region === "southafrica") ? ServerRegionsEmotes.SOUTH_AFRICA : (guild.region === "hongkong") ? ServerRegionsEmotes.HONG_KONG : ServerRegionsEmotes[guild.region.replace("-", "_").toUpperCase() as keyof typeof ServerRegionsEmotes];
			const embed: MessageEmbed = new MessageEmbed()
				.setColor(SERVER_INFOS_COLOR)
				.setAuthor(guild.name, icon)
				.setThumbnail(guild.iconURL({ dynamic: true }))
				.setImage(guild.splashURL({ size: 4096 }))
				.setFooter(`Shortcuts - 1️⃣ : ${this.client.prefix}roles 2️⃣ : ${this.client.prefix}emotes`)
				.addFields([
					{
						name: "ID",
						value: guild.id,
						inline: true,
					},
					{
						name: "Owner",
						value: guild.owner || guild.ownerID + " (Couldn't get user)",
						inline: true
					},
					{
						name: "\u200B",
						value: "\u200B",
						inline: true
					},
					{
						name: "Creation",
						value: guild.createdAt.toUTCString(),
						inline: true
					},
					{
						name: "Age",
						value: formatDuration(new Date(), guild.createdAt),
						inline: true
					},
					{
						name: "Members",
						value: `${ServerInfosEmotes.ONLINE} **${online}** Online ${BLANK_EMOTE} ${ServerInfosEmotes.OFFLINE} **${members}** Members`,
					},
					{
						name: "Channels",
						value: `${ServerInfosEmotes.TEXT_CHANNEL} **${texts}** Text ${BLANK_EMOTE} ${ServerInfosEmotes.VOICE_CHANNEL} **${voices}** Voice`,
					},
					{
						name: "Voice Region",
						value: `${flag} **${formatRegion(guild.region)}**`
					},
					{
						name: "Boosts",
						value: `${(boosts > 0) ? ServerInfosEmotes.BOOST : ServerInfosEmotes.NO_BOOST} **${boosts}** ${(level > 0) ? `(Level ${level})` : ""}`,
						inline: true
					},
					{
						name: "Bans",
						value: ServerInfosEmotes.BAN + ` **${num((await guild.fetchBans()).array().length)}**`,
						inline: true
					},
					{
						name: `Roles (more with ${this.client.prefix}roles)`,
						value: `**${num(guild.roles.cache.array().length)}**`
					},
					{
						name: `Emotes (more with ${this.client.prefix}emotes)`,
						value: `**${guild.emojis.cache.array().length}**/${(level == + 3) ? 500 : 100 * (level + 1)}`,
					}
				]);
			if (guild.vanityURLCode) {
				const vanity = await guild.fetchVanityData();
				embed.addField("Vanity URL", `[**https://discord.gg/${vanity.code}**](https://discord.gg/${vanity.code}) ${(vanity.uses) ? `(${vanity.uses} uses)` : ""}`);
			}
			const msg: Message = await message.channel.send(embed);
			await msg.react("1️⃣");
			await msg.react("2️⃣");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, user) => {
				reaction.users.remove(user);
				if (user !== message.author) return;
				if (reaction.emoji.name === "1️⃣") {
					this.client.commands.get("roles").exe(message, []);
					collector.stop();
					return;
				}
				if (reaction.emoji.name === "2️⃣") {
					this.client.commands.get("emotes").exe(message, []);
					collector.stop();
					return;
				}
			});
			collector.on("end", (_collected, _reason) => {
				msg.reactions.removeAll();
				embed.setFooter("");
				msg.edit(embed);
			});
		});
	}
}