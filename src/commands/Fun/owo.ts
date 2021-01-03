import { Message, MessageEmbed, ReactionCollector, User } from "discord.js";
import { join } from "path";
import { createWriteStream, unlinkSync, WriteStream } from "fs";
import { createCanvas, Canvas, registerFont } from "canvas";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import UserOwoInfo from "../../core/typedefs/UserOwoInfo";
import { parseUser } from "../../core/lib/Args";
import { formatDuration } from "../../core/lib/Time";
import * as log from "../../core/lib/Log";

const EYES: string[] = ["OO", "oo", "ÒÓ", "òó", "QQ", "qq", "ÈÉ", "èé", "ÙÚ", "ùú", "VV", "TT", "><", "--", "••", "°°", "¨¨", "¬¬", ";;", "^^", "++", "**", "~~", "==", "##", "@@", "$$", "''"];
const MOUTHS: string[] = ["w", "W", "u", "v", "_", ".", "m", "x", "…"];

export = class extends Command {
	public totalOwos: number;
	public allOwos: string[];
	constructor(client: Tofu) {
		super(client, {
			name: "owo",
			desc: "The owo gacha.",
			usages: [
				"",
				"inventory/inv [user: User]",
				"missing [user: User]"
			],
			aliases: ["uwu"],
			module: "Fun"
		});
		var allOwos: string[] = [];
		for (const e of EYES) {
			for (const m of MOUTHS) {
				allOwos.push(e[0] + m + e[1]);
				if (e[0] !== e[1]) allOwos.push(e[1] + m + e[0]);
			}
		}
		this.allOwos = allOwos;
		this.totalOwos = allOwos.length;
		registerFont(join(__dirname, "../../../assets/fonts/ArchitectsDaughter.ttf"), { family: "Architects Daughter" });
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var owoInfos: UserOwoInfo;
			if (args[0] && (args[0].toLowerCase() === "inv" || args[0].toLowerCase() === "inventory" || args[0].toLowerCase() === "missing")) {
				const missing: boolean = args[0].toLowerCase() === "missing";
				const user: User = parseUser(args[1], this.client);
				if (args[1] && !user) {
					this.error("User not found", message.channel);
					return;
				}
				owoInfos = await this.client.db.fetchOwoInfo(user || message.author);
				if (!owoInfos || owoInfos.gotten.length == 0) {
					if (user) message.channel.send(`**${user.username}'s inventowory is empty.**`);
					else message.channel.send(`**You have nothing in your inventowory yet**\n**Use** \`${this.client.prefix}owo\` **to start your collection!**`);
					return;
				}
				const gotten: string[] = owoInfos.gotten;
				const arr: string[] = (missing) ? this.allOwos.filter(o => !gotten.includes(o)) : gotten;
				var i: number = 0;
				const pages: number = Math.ceil(arr.length / 10);
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(`${(user) ? user.username : message.author.username}'s ${(missing) ? 'missing owos' : 'inventowory'}`, (user || message.author).displayAvatarURL({ dynamic: true }))
					.setTitle((missing) ? `${arr.length} missing` : `${arr.length}/${this.totalOwos} owos`)
					.setColor("#FFEEFF")
					.setFooter(`Page ${i + 1}/${pages}`)
				embed.setDescription(`**${arr.slice(i * 10, (i + 1) * 10).join("\n")}**`);
				const msg: Message = await message.channel.send(embed);
				await msg.react("⬅");
				await msg.react("➡");
				const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
				collector.on("collect", (reaction, user) => {
					reaction.users.remove(user);
					if (user.id !== message.author.id) return;
					if (reaction.emoji.name === "⬅") {
						if (--i < 0) i = pages - 1;
						embed.setDescription(`**${arr.slice(i * 10, (i + 1) * 10).map(owo => this.displayOwo(owo)).join("\n")}**`)
							.setFooter(`Page ${i + 1}/${pages}`);
						msg.edit(embed);
					} else if (reaction.emoji.name === "➡") {
						if (++i == pages) i = 0;
						embed.setDescription(`**${arr.slice(i * 10, (i + 1) * 10).map(owo => this.displayOwo(owo)).join("\n")}**`)
							.setFooter(`Page ${i + 1}/${pages}`);
						msg.edit(embed);
					}
				});
				collector.on("end", (_collected, _reason) => {
					msg.reactions.removeAll();
				});
				return;
			}

			owoInfos = await this.client.db.fetchOwoInfo(message.author);
			var firstOwo = false;
			if (!owoInfos) {
				owoInfos = await this.client.db.createOwoInfo(message.author);
				owoInfos.last = new Date(0);
				firstOwo = true;
			}
			if (Date.now() - owoInfos.last.getTime() < 3600000) {
				message.channel.send(`❌ You must wait another **${formatDuration(new Date(3600000 - Date.now() + owoInfos.last.getTime()), new Date(0))}** before getting a new owo.\nBored? Try The owo generator! => **https://hickacou.js.org/owo**`);
				return;
			}
			var lostStreak: boolean = false;
			if (Date.now() - owoInfos.last.getTime() > 86400000) {
				owoInfos.streak = 1;
				lostStreak = !firstOwo;
			} else {
				if (firstOwo) owoInfos.streak = 1;
				else owoInfos.streak++;
			}
			var oldLength: number = owoInfos.gotten.length;
			const owo: string = this.generateOwo();
			var alreadyHas: boolean = owoInfos.gotten.includes(owo);
			if (!alreadyHas) owoInfos.gotten.push(owo);
			const filename: string = `owo_${message.author.id}_${Date.now()}.png`;
			const ws: WriteStream = await this.generateOwoImage(owo, filename);
			ws.on("finish", async () => {
				const embed: MessageEmbed = new MessageEmbed()
					.attachFiles([{ attachment: `temp/${filename}`, name: "owo.png" }])
					.setTitle(this.displayOwo(owo))
					.setDescription((alreadyHas) ? `You got a **${this.displayOwo(owo)}**...\n...but you already have it in your inventowory.` : `**That's a new owo!**\nYou got a **${this.displayOwo(owo)}**!`)
					.setColor("#FFEEFF")
					.setImage("attachment://owo.png")
					.setFooter(`You have ${owoInfos.gotten.length}/${this.totalOwos} owos`, message.author.displayAvatarURL({ dynamic: true }));
				await message.channel.send(`**Current streak: \`${owoInfos.streak}\`**`, embed);
				log.info(`${log.user(message.author)} got a ${log.text(owo)} | x${log.number(owoInfos.streak)} | ${owoInfos.gotten.length}/${this.totalOwos}`);
				unlinkSync(join(__dirname, "../../../temp/", filename));
				if (lostStreak) message.channel.send("It has been more than 24 hours since your last owo, your streak has been reset..");
				if (owoInfos.streak % 50 == 0 && owoInfos.gotten.length < this.totalOwos) {
					var chance: string;
					var notGotten = this.allOwos.filter((owo: string) => !owoInfos.gotten.includes(owo))
					chance = this.generateOwo(notGotten);
					owoInfos.gotten.push(chance);
					const filename: string = `owo_${message.author.id}_${Date.now()}.png`;
					const ws: WriteStream = await this.generateOwoImage(chance, filename, true);
					ws.on("finish", () => {
						const embed: MessageEmbed = new MessageEmbed()
							.attachFiles([{ attachment: `temp/${filename}`, name: "owo.png" }])
							.setTitle(`Streak gift! ${this.displayOwo(chance)}`)
							.setDescription(`You've been gifted a **${this.displayOwo(chance)}** for your streak! Keep going!\n`)
							.setColor("#FFE100")
							.setImage("attachment://owo.png")
							.setFooter(`You have ${owoInfos.gotten.length}/${this.totalOwos} owos`, message.author.displayAvatarURL({ dynamic: true }));
						message.channel.send(embed);
						log.info(`${log.user(message.author)} was gifted a ${log.text(chance)} | ${owoInfos.gotten.length}/${this.totalOwos}`);
						unlinkSync(join(__dirname, "../../../temp/", filename));
					});
				}
				if (owoInfos.gotten.length == this.totalOwos && oldLength !== owoInfos.gotten.length) {
					message.channel.send(`✨ **You finished the collection! You got all the *${this.totalOwos}* owos in your inventowory!!** ✨`);
				}
				this.client.db.updateOwo(message.author, owoInfos.gotten, owoInfos.streak);
			});
		});
	}

	public generateOwo(arr: string[] = this.allOwos): string {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	public async generateOwoImage(owo: string, filename: string, golden: boolean = false): Promise<WriteStream> {
		const canvas: Canvas = createCanvas(800, 300);
		const ctx = canvas.getContext("2d");
		ctx.font = "150pt Architects Daughter";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = (golden) ? "#FFE100" : "#FFEEFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = (golden) ? "#FFEEFF" : "#000000";
		ctx.fillText(owo, canvas.width / 2, canvas.height / 2);
		const ws: WriteStream = createWriteStream(join(__dirname, "../../../temp/", filename));
		canvas.createPNGStream().pipe(ws);
		return ws;
	}

	public displayOwo(owo: string): string {
		return owo.replace(/(_|\*|~)/gi, "\\$1")
	}

}
