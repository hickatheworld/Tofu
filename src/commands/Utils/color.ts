import { Message, MessageEmbed, GuildMember, Role } from "discord.js";
import { createCanvas, Canvas, PNGStream } from "canvas";
import nodeFetch from "node-fetch";
import { join } from "path";
import { unlinkSync, createWriteStream, WriteStream } from "fs";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "color",
			desc: "Displays a color from a given hexcode. Data provided by [thecolorapi.com](http://thecolorapi.com)",
			module: "Utils",
			usages: [
				"<hexcode: String>"
			],
			cooldown: 20000
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const hexRegExp: RegExp = /#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/;
			var color: string;
			if (hexRegExp.test(args[0])) {
				color = hexRegExp.exec(args[0])[1].toUpperCase();
			} else {
				this.error("Please provide a correct color hexcode.", message.channel);
				return;
			}

			const botMember: GuildMember = message.guild.member(this.client.user);
			const name: string = Math.random().toString(36).slice(2) + ".png";
			const res = await nodeFetch(`https://www.thecolorapi.com/id?format=json&hex=${color}`);
			const data: any = await res.json();
			const canvas: Canvas = createCanvas(800, 200);
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = data.hex.value;
			ctx.fillRect(0, 0, 800, 200);
			ctx.fill();
			const outStream: WriteStream = createWriteStream(join(__dirname, "../../../temp", name));
			const stream: PNGStream = canvas.createPNGStream();
			stream.pipe(outStream);
			stream.on("error", (err) => {
				this.error(`An error occured`, message.channel, err);
			})
			stream.on("end", async () => {
				const embed: MessageEmbed = new MessageEmbed()
					.setTitle(`${data.hex.value}`)
					.setDescription(`${data.hex.value} — **${data.name.value}**`)
					.setColor(data.hex.clean)
					.attachFiles([`temp/${name}`])
					.setImage(`attachment://${name}`);
				var exampleRole: Role;
				if (botMember.hasPermission("MANAGE_ROLES")) {
					exampleRole = await message.guild.roles.create({
						data: {
							name: "Example role",
							color: data.hex.clean
						},
						reason: `Example for ${this.client.prefix}${this.name}`
					});
					embed.description += `\nHere is how it would look on a role : ${exampleRole.toString()}`;
				}
				await message.channel.send(embed);
				unlinkSync(join(__dirname, "../../../temp/", name));
				if (exampleRole) setTimeout(() => {
					exampleRole.delete(`Example for ${this.client.prefix}${this.name}`);
				}, 20000);
			});
		});
	}
}