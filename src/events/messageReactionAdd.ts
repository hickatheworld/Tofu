import { MessageReaction, User, ReactionCollector, Message, MessageEmbed } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import StarboardSettings from "../core/typedefs/StarboardSettings";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "messageReactionAdd");
		this.props.set("starMessages", new Map<string, Message>());
	}

	public async exe(reaction: MessageReaction, _user: User): Promise<void> {
		const guildSettings: StarboardSettings = await this.client.db.getStarboard(reaction.message.guild);
		if (!guildSettings.enabled) return;

		if (reaction.count > 2 || reaction.emoji.name !== "⭐") return;
		const collector: ReactionCollector = new ReactionCollector(reaction.message, r => r.emoji.name === "⭐", { time: 120000, dispose: true });
		collector.on("collect", async (r, _u) => {
			const star: string = (r.count < 5) ? "⭐" : (r.count < 10) ? "🌟" : "✨";
			if (reaction.count >= 2) {
				if (!this.props.get("starMessages").has(reaction.message.id)) {
					const link: string = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;
					const embed: MessageEmbed = new MessageEmbed()
						.setAuthor(reaction.message.author.username, reaction.message.author.avatarURL({ dynamic: true }))
						.setDescription(reaction.message.content)
						.addField("Attachments", "_ _", false)
						.addField("Original", `[Jump!](${link})`, false)
						.setTimestamp(reaction.message.createdTimestamp)
						.setColor("FFF23D");
					if (reaction.message.attachments.array().length > 0) {
						for (const attachment of reaction.message.attachments.array()) {
							if (attachment.width && attachment.height && !embed.image) {
								embed.setImage(attachment.url);
							}
							embed.fields[0].value += `[${attachment.name}](${attachment.url})\n`;
						}
						embed.fields[0].value.slice(3);
					} else {
						embed.spliceFields(0, 1);
					}
					this.props.get("starMessages").set(reaction.message.id, (await guildSettings.channel.send(`${star} **${r.count}**`, embed)));
					return;
				}
				const msg: Message = this.props.get("starMessages").get(reaction.message.id);
				msg.edit(`${star} **${r.count}**`, msg.embeds[0]);
			}
		});
		collector.on("remove", async (r, _u) => {
			const msg: Message = this.props.get("starMessages").get(reaction.message.id);
			if (r.count < 2) {
				reaction.message.reactions.cache.get("⭐").remove();
				msg.delete();
				this.props.get("starMessages").delete(reaction.message.id);
				collector.stop();
				return;
			}
			const star: string = (r.count < 2) ? "⭐" : (r.count < 10) ? "🌟" : "✨";
			msg.edit(`${star} **${r.count}**`, msg.embeds[0]);
		});
		collector.on("end", (_collected, reason) => {
			if (reason === "messageDelete") {
				this.props.get("starMessages").get(reaction.message.id).delete();
			}
		});
	}
}	