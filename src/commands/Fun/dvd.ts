import { Message, MessageEmbed, MessageCollector, Snowflake } from "discord.js";
import Command from "../../core/base/Command";
// @ts-ignore
import GIFEncoder = require("gifencoder");
import OCBot from "../../core/base/Client";
import DVD from "../../core/typedefs/DVD";
import { Image, loadImage, Canvas } from "canvas";
import { join } from "path";
import { createWriteStream, unlinkSync } from "fs";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "dvd",
			desc: "Gives you a gif of a goold old dvd screensaver. Try to make it touch the corner!",
			module: "Fun",
			"usages": [
				"stats",
				"reset (Mod only)"
			],
			cooldown: 60000
		});
	}

	public async setup(): Promise<void> {
		this.props.set("busy", new Set<Snowflake>());
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const dvdState: DVD = await this.client.db.getDVD(message.guild);
			const subcommand: string = (args[0]) ? args[0].toLowerCase() : "";
			if (subcommand === "stats") {
				var dir: string = "";
				var dirEmote: string;
				dir += (dvdState.yspeed == 5) ? "South-" : "North-";
				dir += (dvdState.xspeed == 5) ? "East" : "West";
				if (dir === "South-East") dirEmote = "↘";
				if (dir === "South-West") dirEmote = "↙";
				if (dir === "North-East") dirEmote = "↗";
				if (dir === "North-West") dirEmote = "↖";
				const embed: MessageEmbed = new MessageEmbed()
					.setTitle(`DVD stats for ${message.guild.name}`)
					.setDescription(`Screen size: 800x600\nDirection : ${dirEmote} **${dir}**\nX Position : **${dvdState.x}**\nY Position : **${dvdState.y}**\nEdge hits : **${dvdState.edges}**\nCorner hits : **${dvdState.corners}**`);
				message.channel.send(embed);
				return;
			}
			if (subcommand === "reset") {
				await message.reply(`are you sure that you want to reset ${message.guild.name}'s DVD? **(yes/no)**`);
				const collector: MessageCollector = message.channel.createMessageCollector((msg) => msg.author === message.author, { time: 3000 });
				collector.on("collect", async (msg) => {
					const t: string = msg.content.toLowerCase();
					if (t === "yes") {
						await this.client.db.resetDVD(message.guild);
						message.channel.send("✅ Reset DVD.");
						collector.stop();
						return;
					}
					if (t === "no") {
						message.channel.send("✅ Cancelled reset.");
						collector.stop();
						return;
					}
				});
				collector.on("end", (_collected, reason) => {
					if (reason === "time") {
						message.channel.send("❌ You've been idle for too long. DVD reset cancelled.");
					}
				});
				return;
			}
			if (this.props.get("busy").has(message.guild.id)) {
				message.channel.send("❌ A gif is already being generated for this guid. Please wait.");
				return;
			}
			this.props.get("busy").add(message.guild.id);
			var updatedDVD: DVD = dvdState;
			const pos: number[] = [dvdState.x, dvdState.y];
			const speed: number[] = [dvdState.xspeed, dvdState.yspeed];
			const DVDLogo: Image = await loadImage(join(__dirname, "../../../assets/img/dvdlogo.png"));
			const encoder: GIFEncoder = new GIFEncoder(800, 600);
			const canvas: Canvas = new Canvas(800, 600);
			const ctx = canvas.getContext("2d");
			const start: number = Date.now();
			var corner: boolean = false;
			encoder.createReadStream().pipe(createWriteStream(join(__dirname, "../../../temp", `dvd_${message.guild.id}.gif`)))
			encoder.setDelay(0);
			encoder.start();
			const generationMessage: Message = await message.channel.send("Generating gif...");
			for (var i = 0; i < 100; i++) {
				let hits = 0;
				ctx.fillRect(0, 0, 800, 600);
				ctx.drawImage(DVDLogo, pos[0], pos[1]);
				pos[0] += speed[0];
				pos[1] += speed[1];
				if (pos[0] + DVDLogo.width >= 800 || pos[0] <= 0) {
					speed[0] = -speed[0];
					hits++;
				}
				if (pos[1] + DVDLogo.height >= 600 || pos[1] <= 0) {
					speed[1] = -speed[1];
					hits++;
				}
				if (hits == 1) {
					updatedDVD.edges++;
				} else if (hits == 2) {
					updatedDVD.corners++;
					corner = true;
				}
				encoder.addFrame(ctx);
			}
			try {
			encoder.finish();
			this.props.get("busy").delete(message.guild.id);
			const duration: number = Date.now() - start;
			updatedDVD.x = pos[0];
			updatedDVD.y = pos[1];
			updatedDVD.xspeed = speed[0];
			updatedDVD.yspeed = speed[1];
			await this.client.db.updateDVD(message.guild, updatedDVD);
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`Edge hits : **${updatedDVD.edges}** | Corner hits : **${updatedDVD.corners}**`)
				.setFooter(`GIF generated in ${(duration / 1000).toFixed(2)}s`)
				.attachFiles([`temp/dvd_${message.guild.id}.gif`])
				.setImage(`attachment://dvd_${message.guild.id}.gif`)
				;
			if (corner) embed.description += "\n🎉**IT HIT THE CORNER!**";
			await message.channel.send(embed);
			generationMessage.delete();
			unlinkSync(join(__dirname, "../../../temp", `dvd_${message.guild.id}.gif`));
			} catch (err) {
				message.channel.send(`❌ An error occured :\n\`${err.toString()}\``);
			}
		});
	}
}