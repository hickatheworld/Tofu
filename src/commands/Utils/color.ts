import { Message, MessageEmbed, GuildMember, Role } from "discord.js";
import gm = require("gm");
import nodeFetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { join } from "path";
import { unlink, unlinkSync } from "fs";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "color",
			desc: "Displays a color from a given hexcode. Data provided by [thecolorapi.com](http://thecolorapi.com)",
			module: "Utils",
			usages: [
				"<hexcode: String>"
			],
			cooldown: 5000
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
				message.channel.send("❌ Please provide a correct color hexcode.");
				return;
			}

			const botMember: GuildMember = message.guild.member(this.client.user);
			const name: string = Math.random().toString(36).slice(2) + ".png";
			const res = await nodeFetch(`https://www.thecolorapi.com/id?format=json&hex=${color}`);
			const data: any = await res.json();
			gm(800, 200, `#${color}`).write(join(__dirname, "../../../temp/", name), async (err) => {
				if (err) {
					message.channel.send(`❌ An error occured :\n\`${err.message}\``);
					return;
				}
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