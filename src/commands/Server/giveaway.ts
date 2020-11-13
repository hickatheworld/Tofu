import { Collection, Guild, GuildChannel, GuildMember, Message, MessageCollector, MessageEmbed, MessageReaction, Snowflake, TextChannel, User } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseChannel, parseDuration, parseNumber } from "../../core/lib/Args";
import { BotResponseColors, BotResponseEmotes, GIVEAWAY_EMOTE, GIVEAWAY_EMOTE_ID } from "../../core/lib/Constants";
import Giveaway from "../../core/typedefs/Giveaway";
import { formatDate, formatTime } from "../../core/lib/Time";
import * as log from "../../core/lib/Log";
import { randomInt } from "../../core/lib/utils";

export = class extends Command {
	public loaded: boolean;
	constructor(client: OCBot) {
		super(client, {
			name: "giveaway",
			desc: "Organize a giveaway in your server!\n[Full help in this wiki](https://github.com/Hickacou/OC-Bot/wiki/oc!giveaway)",
			usages: [
				"create [channel: Channel] [winners: Number] [duration: Duration] [name: String]",
				"cancel <id: Number>",
				"list",
			],
			module: "Server",
			aliases: ["ga"],
			perms: ["MANAGE_GUILD"]
		});
		this.loaded = false;
	}
	public async setup(): Promise<void> {
		this.client.giveaways = await this.client.db.fetchGiveaways();
		log.info("Loaded giveaways.");
		this.client.giveaways.filter(ga => !ga.finished).each((ga) => this.giveawayTimeout(ga.id));
		log.info("Setup giveaway timeouts");
		this.loaded = true;
	}
	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			if (!this.loaded) {
				this.warn("The giveaway command is still setting up, please wait.", message.channel);
				return;
			}
			const subcommand: string = args.shift().toLowerCase();
			if (!this[subcommand]) {
				this.error(`Unknow subcommand. Do \`${this.client.prefix}help ${this.name}\` to get help with this command.`, message.channel);
				return;
			}
			this[subcommand](message, args);
		});
	}

	/* Subcommand methods */

	public async create(message: Message, args: string[]): Promise<void> {
		var channel: GuildChannel = null;
		var winners: number = null;
		var end: Date = null;
		var name: string = null;
		for (var i = 0; i < 4; i++) {
			if (args.length == 0) break;
			switch (i) {
				case 0: {
					channel = parseChannel(args[0] || "", message.guild);
					if (!channel) break;
					if (!channel.permissionsFor(message.guild.me).has("SEND_MESSAGES") || !channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) channel = null;
					break;
				}
				case 1: {
					winners = parseNumber(args[1] || "");
					if (winners < 1) winners = null;
					break;
				}
				case 2: {
					const dur: number = parseDuration(args[2] || "");
					if (dur < 60000) break;
					end = new Date(Date.now() + dur);
					break;
				}
				case 3: {
					name = args.slice(3).join(" ").trim();
					if (name === "" || name.length > 30) name = null;
					break;
				}
			}
		}
		var complete: boolean = (channel && winners && end && name) ? true : false;
		if (complete) {
			const ga: Giveaway = {
				channel: channel,
				end: end,
				finished: false,
				guild: message.guild,
				host: message.author,
				name: name,
				winCount: winners
			}
			this.completeGiveaway(ga, message);
			return;
		}
		const collector: MessageCollector = new MessageCollector(message.channel as TextChannel, (msg) => msg.author === message.author, { idle: 60000 });
		const sentences: { [key: string]: string } = {
			channel: "Argument required : **channel**\nPlease specify the channel you want to host the giveaway in.",
			winners: "Argument required : **winners**\nPlease specify the number of winners for this giveaway. It must be an integer greater than 0.",
			end: "Argument required : **duration**\nPlease specify the duration of the giveaway",
			name: "Optionnal argument : **name**\nSpecify the name of this giveaway."
		}
		const makerEmbed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
			.setTitle(`Create a new giveaway ${(channel) ? `in #${channel.name}` : ""}`)
			.setColor("BLUE")
			.setFooter("Send cancel to stop giveaway creation");
		switch (null) {
			case channel: makerEmbed.setDescription(sentences.channel); break;
			case winners: makerEmbed.setDescription(sentences.winners); break;
			case end: makerEmbed.setDescription(sentences.end); break;
			case name: makerEmbed.setDescription(sentences.name); break;
		}
		const makerMsg: Message = await message.channel.send(makerEmbed);
		collector.on("collect", async (msg: Message) => {
			if (msg.content.toLowerCase() === "cancel") {
				msg.delete();
				collector.stop("cancelled");
				return;
			}
			switch (null) {
				case channel: {
					channel = parseChannel(msg.content, msg.guild);
					if (!channel) {
						await msg.react(BotResponseEmotes.ERROR);
						setTimeout(() => msg.delete(), 1500);
					} else if (!channel.permissionsFor(message.guild.me).has("SEND_MESSAGES") || !channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
						const m: Message = await message.channel.send("*I can't send embed messages in this channel. Make sur I have the `Send Messages` and `Embed Links` permissions there.*");
						setTimeout(() => { msg.delete(); m.delete() }, 3000);
					} else {
						makerEmbed.setTitle(`Create a new giveaway in #${channel.name}`);
						makerMsg.edit(makerEmbed);
						msg.delete();
					}
					break;
				}
				case winners: {
					winners = parseNumber(msg.content);
					if (!winners || winners < 1) {
						winners = null;
						await msg.react(BotResponseEmotes.ERROR);
						setTimeout(() => msg.delete(), 1500);
					} else msg.delete();
					break;
				}
				case end: {
					const dur: number = parseDuration(msg.content);
					if (!dur) {
						await msg.react(BotResponseEmotes.ERROR);
						setTimeout(() => msg.delete(), 1500);
						return;
					} else msg.delete();
					end = new Date(Date.now() + dur);
					break;
				}
				case name: {
					makerEmbed.setDescription(sentences.name);
					makerMsg.edit(makerEmbed);
					if (msg.content.length > 30) {
						const m: Message = await message.channel.send("Name must be less than 30 characters long.");
						await msg.react(BotResponseEmotes.ERROR);
						setTimeout(() => { msg.delete(); m.delete(); }, 1500);
						return;
					}
					name = msg.content;
					msg.delete();
					break;
				}
			}
			switch (null) {
				case channel: makerEmbed.setDescription(sentences.channel); break;
				case winners: makerEmbed.setDescription(sentences.winners); break;
				case end: makerEmbed.setDescription(sentences.end); break;
				case name: makerEmbed.setDescription(sentences.name); break;
			}
			makerMsg.edit(makerEmbed);
			complete = (channel && winners && end && name) ? true : false;
			if (complete) {
				makerMsg.delete();
				collector.stop("complete");
			}
		});
		collector.on("end", async (_collected, reason) => {
			switch (reason) {
				case "complete": {
					const ga: Giveaway = {
						channel: channel,
						end: end,
						finished: false,
						guild: message.guild,
						host: message.author,
						name: name,
						winCount: winners
					}
					this.completeGiveaway(ga, message);
					return;
				}
				case "idle": {
					this.error("You've been idle for too long. Giveaway creation cancelled.", message.channel);
					makerMsg.delete();
					return;
				}
				case "cancelled": {
					makerMsg.delete();
					this.success("Giveaway creation cancelled", message.channel);
					return;
				}
			}
		});
	}
	public async cancel(message: Message, args: string[]): Promise<void> {
		const id = parseNumber(args.shift()) || -1;
		const ga: Giveaway = this.client.giveaways.get(id);
		if (!ga || ga.guild.id !== message.guild.id) {
			this.error("Can't find giveaway.", message.channel);
			return;
		}
		if (ga.finished) {
			this.error("This giveaway is already finished.", message.channel);
			return;
		}
		ga.message.reactions.cache.get(GIVEAWAY_EMOTE_ID).users.cache.filter(u => !u.bot).each(m => {
			m.send(`The giveaway ${ga.name} hosted in ${ga.channel} by ${ga.host} has been cancelled by ${message.author}.`);
		});
		this.client.giveaways.get(id).finished = true;
		this.client.giveaways.get(id).end = new Date();
		await this.client.db.models.giveaways.update({ finished: true, end: new Date() }, { where: { id: id } });
		this.success(`The giveaway ${ga.name} (Hosted by ${ga.host}) has been cancelled.`, message.channel);
	}

	public async list(message: Message, args: string[]): Promise<void> {
		const giveaways: Giveaway[] = this.client.giveaways.filter(ga => ga.guild === message.guild).array().reverse().slice(0, 10);
		if (giveaways.length < 1) {
			this.error("No giveaway found.", message.channel);
			return;
		}
		var msg: string = `__10 last giveaways hosted in ${message.guild.name}__ :\n\n`;
		for (const ga of giveaways) {
			msg += `\`${ga.id}\` - ${ga.name} hosted by **${ga.host.tag}** in ${ga.channel} `
			if (ga.finished) {
				var winners: string[] = [];
				if (ga.winners) {
					winners = ga.winners.map(r => {
						const u: GuildMember = r as GuildMember;
						if (u.user && u.user.tag) { return u.user.tag }
						return (r as Snowflake);
					});
				}
				msg += `| Ended the **${formatDate(ga.end)} at ${formatTime(ga.end, false)} UTC** | Winners : ${(winners.length > 0) ? winners.map(s => `**${s}**`).join(", ") : "**Nobody**"}`
			} else {
				msg += `| Ends the **${formatDate(ga.end)} at ${formatTime(ga.end, false)} UTC** | **${ga.winCount}** winner${(ga.winCount > 1) ? "s" : ""}`
			}
			msg += "\n";
		}
		message.channel.send(msg);
	}

	/* Utility methods */

	public async completeGiveaway(ga: Giveaway, message: Message): Promise<void> {
		const displayEnd: string = `${formatDate(ga.end)} at ${formatTime(ga.end, false)} UTC`;
		const gaEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(ga.name)
			.setDescription(`**React with ${GIVEAWAY_EMOTE} to participate!**\nHosted by ${ga.host}`)
			.setColor("E73863")
			.setFooter(`${ga.winCount} winner${(ga.winCount > 1) ? "s" : ""} | End`)
			.setTimestamp(ga.end);
		ga.message = await (ga.channel as TextChannel).send(`**And that's a new giveaway!**`, gaEmbed);
		await ga.message.react(GIVEAWAY_EMOTE_ID);
		const registeredGA: Giveaway = await this.client.db.createGiveaway(ga);
		this.client.giveaways.set(registeredGA.id, registeredGA);
		this.giveawayTimeout(registeredGA.id);
		const successEmbed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
			.setColor(BotResponseColors.SUCCESS)
			.setTitle("Giveaway created")
			.setDescription(`**Name**: ${ga.name}\n**Channel**: ${ga.channel}\n**End**: ${displayEnd}\n**Winners**: ${ga.winCount}`)
			.setFooter(`Giveaway ID: ${registeredGA.id}`);
		message.channel.send(successEmbed);
	}

	public giveawayTimeout(gaID: number): void {
		const time: number = this.client.giveaways.get(gaID).end.getTime() - Date.now();
		setTimeout(async () => {
			const ga: Giveaway = this.client.giveaways.get(gaID);
			if (!ga || ga.finished) return;
			const reaction: MessageReaction = ga.message.reactions.resolve(GIVEAWAY_EMOTE_ID);
			const reactions: Collection<string, User> = (reaction) ? (await reaction.users.fetch()).filter(u => (!u.bot && u !== ga.host)) : null;
			const users: User[] = (reactions) ? reactions.array() : [];
			var winners: GuildMember[] = this.pickWinners(users, ga.guild, ga.winCount);
			ga.winners = winners;
			const embed: MessageEmbed = ga.message.embeds[0];
			const participants: number = (reactions) ? reactions.size : 0;
			if (winners.length == 0) {
				if (embed) embed.setDescription(`\n**Winner**: Nobody\n**Hosted by**: ${ga.host}`);
				(ga.channel as TextChannel).send(`Nobody won the ${ga.name} giveaway. Did you react the message ??`);
			} else {
				if (embed) embed.setDescription(`\n**Winner${(winners.length > 1) ? "s" : ""}**: ${winners.join(", ")} out of **${participants}** participating!\n**Hosted by**: ${ga.host}`);
				(ga.channel as TextChannel).send(`Congratulations to ${winners.join(", ")} for winning the ${ga.name} giveaway!`);
				for (const winner of winners) {
					winner.send(`Congratulations! You won the ${ga.name} giveaway hosted in ${ga.channel}!`);
				}
			}
			if (embed) {
				embed.setFooter("Ended at")
					.setColor("#2f3136");
			}
			if (embed) ga.message.edit("**Too late, this giveaway has ended.**", embed);
			else ga.message.edit("**Too late, this giveaway has ended.**");
			this.client.giveaways.set(ga.id, ga);
			this.client.db.models.giveaways.update({ finished: true, winners: winners.map(m => m.id).join(",") }, { where: { id: ga.id } });
		}, time);
	}

	public pickWinners(users: User[], guild: Guild, count: number): GuildMember[] {
		const winners: GuildMember[] = [];
		while (winners.length < count) {
			const index: number = randomInt(0, users.length - 1);
			const u: User = users[index];
			users = users.slice(0, index).concat(users.slice(index + 1));
			const m: GuildMember = guild.member(u);
			if (m) winners.push(m);
			if (users.length == 0 || winners.length == count) break;
		}
		return winners;
	}
}