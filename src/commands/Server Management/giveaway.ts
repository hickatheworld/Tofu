import { Message, TextChannel, MessageEmbed, MessageCollector } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import * as Args from "../../core/lib/Args";
import * as log from "../../core/lib/Log";
import Giveaway from "../../core/typedefs/Giveaway";
import { formatDate, formatTime } from "../../core/lib/Time";
import { collectGiveaway } from "../../core/lib/utils";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "giveaway",
			desc: "Manages giveaways (Admin only)",
			module: "Server Management",
			usages: [
				"create [channel: Channel]",
				"list",
				"cancel <ID: Number>",
			],
			aliases: ["ga"],
			whitelist: client.admins
		});
	}

	public async setup(): Promise<void> {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var subcommand: string = "";
			if (args[0]) subcommand = args[0].toLowerCase();
			if (subcommand === "create") {
				const gaChannel: TextChannel = (Args.parseChannel(args[1], message.guild) || message.channel) as TextChannel;
				const creationEmbed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle(`Make a new giveaway in **#${gaChannel.name}**`)
					.setDescription("__Please specify giveaway name__")
					.setFooter("Type 'cancel' to abort giveaway creation.")
					;
				const creationMessage: Message = (await message.channel.send(creationEmbed));
				var ga: Giveaway = {
					id: null,
					name: null,
					channel: gaChannel,
					message: null,
					winnersCount: null,
					winners: [],
					participating: [],
					end: null,
					finished: false,
					host: message.author
				};
				const optionsCollector: MessageCollector = new MessageCollector(message.channel as TextChannel, msg => msg.author === message.author, { idle: 60000 });
				var step: number = 0;
				optionsCollector.on("collect", async (msg: Message) => {
					if (msg.content.toLowerCase() === "cancel" || msg.content.toLowerCase() === "abort" || msg.content.toLowerCase() === "stop") {
						await creationMessage.delete();
						message.channel.send("✅ Giveaway creation cancelled");
						optionsCollector.stop();
						return;
					}
					switch (step) {
						case 0: {
							ga.name = msg.content;
							creationEmbed.addField("Name", ga.name, true);
							creationEmbed.setDescription("__Please specify number of winners__");
							await creationMessage.edit(creationEmbed);
							if (msg.deletable) msg.delete();
							step++;
							break;
						}
						case 1: {
							if (Args.parseNumber(msg.content) === null || Args.parseNumber(msg.content) < 1) {
								const m: Message = await message.channel.send("❌ Please send a non-zero positive integer");
								setTimeout(() => {
									m.delete()
									if (msg.deletable) msg.delete();
								}, 2000);
								break;
							}
							ga.winnersCount = Args.parseNumber(msg.content);
							creationEmbed.addField("Winners", ga.winnersCount, true);
							creationEmbed.setDescription("__Please specify duration__");
							await creationMessage.edit(creationEmbed);
							if (msg.deletable) msg.delete();
							step++;
							break;
						}
						case 2: {
							const parsed: number = Args.parseDuration(msg.content);
							if (parsed < 60000) {
								const m: Message = await msg.channel.send("❌ Invalid duration. Please use format `{days}d{hours}h{minutes}m` and put correct values.");
								setTimeout(() => {
									m.delete();
									if (msg.deletable) msg.delete();
								}, 3000);
								break;
							}
							const end: Date = new Date();
							end.setTime(end.getTime() + parsed);
							ga.end = end;
							creationEmbed.addField("End", `${formatDate(end)} ${formatTime(end, false, false)} KST`);
							creationEmbed.setDescription("**Giveaway started**");
							await creationMessage.edit(creationEmbed);
							if (msg.deletable) msg.delete();
							step++;
							break;
						}
					}
					if (step === 3) {
						optionsCollector.stop();

						const gaEmbed: MessageEmbed = new MessageEmbed()
							.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
							.setTitle(`Giveaway - ${ga.name}`)
							.setDescription("React on this message with <a:ultraDahyun:704993375748620338> to join giveaway")
							.setColor("E73863")
							.addField("Winners", ga.winnersCount, true)
							.addField("End", `${formatDate(ga.end)} ${formatTime(ga.end, false, false)} KST`, true)
							.addField("Participants", ga.participating.length, true)
							.setFooter("Unreact to leave giveaway | End")
							.setTimestamp(ga.end)
							;
						const gaMessage: Message = await ga.channel.send(gaEmbed);
						gaMessage.react("704993375748620338");
						ga.message = gaMessage;
						ga.id = (await this.client.db.createGiveaway(ga)).id;
						creationEmbed.setFooter(`Giveaway ID : ${ga.id}`)
						creationMessage.edit(creationEmbed);
						collectGiveaway(ga, this.client.db);
					}
				});
				optionsCollector.on("end", async (_collected, reason) => {
					if (reason !== "idle") return;
					await creationMessage.delete();
					message.channel.send("❌ You've been idle for too long. Giveaway creation cancelled.");
				});
				return;
			}

			if (subcommand === "list") {
				const giveaways: Giveaway[] = await this.client.db.getAllGiveaways(false);
				if (giveaways.length < 1) {
					message.channel.send("🤷‍♂️ There are no giveaways going on...");
					return
				}
				message.channel.send(`__Ongoing giveaways :__\n${giveaways.map(ga => `\`[${ga.id}]\` **${ga.name}** | Ends at : \`${formatDate(ga.end, "-")} ${formatTime(ga.end, false, false)} KST\` | Hosted by : **${ga.host.tag}**`).join("\n")}`);
				return;
			}

			if (subcommand === "cancel") {
				if (!args[1]) {
					message.channel.send("❌ Please specify an id.");
					return;
				}
				const id: number = Args.parseNumber(args[1]);
				if (id === null || id < 0) {
					message.channel.send("❌ Please specify a correct id. (non-zero positive integer)");
					return;
				}
				const ga: Giveaway = await this.client.db.finishGiveaway(id, []);
				if (ga === null) {
					message.channel.send(`❌ Unable to find giveaway with ID \`${args[1]}\``);
					return;
				}
				ga.channel.send(`Giveaway **${ga.name}** was cancelled by ${message.author}`);
				for (const user of ga.participating) {
					user.send(`Giveaway **${ga.name}** was cancelled. __If someone is picked as a winner, it is cheating.__`);
				}
				log.info(`${log.user(message.author)} cancelled [${log.number(ga.id)}] ${log.text(ga.name)} giveaway.`);
				message.channel.send(`✅ Cancelled giveaway \`[${ga.id}]\` **${ga.name}**`);
				return;
			}
			message.channel.send(`❌ Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`);
		});
	}
}