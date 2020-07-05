import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, MessageEmbed, User, Guild, TextChannel } from "discord.js";
import * as Args from "../../core/lib/Args";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "welcome",
			desc: "Manages welcome messages and join logs (Admin only)",
			module: "Server Management",
			usages: [
				"enable/disable",
				"variables",
				"embed <embed: Object>",
				"message <message: String>",
				"channel <channel: Channel>",
				"logs enable/disable",
				"logs <channel: Channel>",
			]
		});
		this.funcs.set("replaceVariables", function (obj: Object, user: User, guild: Guild, embed: boolean): Object {
			var str = JSON.stringify(obj);
			str = str.replace("{SERVER_NAME}", guild.name);
			str = str.replace("{USER_NAME}", user.tag);
			str = str.replace("{USER_MENTION}", user.toString());
			if (embed) str = str.replace("{SERVER_ICON}", guild.iconURL({ dynamic: true }));
			if (embed) str = str.replace("{USER_AVATAR}", user.avatarURL({ dynamic: true }));
			return JSON.parse(str);
		});
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const arg0 = args[0].toLowerCase();
			if (arg0 === "enable" || arg0 === "disable") {
				if ((await this.client.db.getWelcome(message.guild)).channel === null) {
					message.channel.send(`❌ Please specify a welcome channel with \`${this.client.prefix}${this.name} channel\``);
					return;
				}
				const enabled = arg0 === "enable";
				await this.client.db.setWelcome(message.guild, "enabled", enabled);
				message.channel.send(`✅ ${enabled ? "Enabled" : "Disabled"} welcome on this server.`);
				return;
			}

			if (arg0 === "variables" || arg0 === "vars") {
				message.channel.send("You can use following variables in your welcome message : `{SERVER_NAME}`, `{USER_NAME}`, `{USER_MENTION}`\n**Embed only :** `{SERVER_ICON}`, `{USER_AVATAR}`");
				return;
			}

			if (arg0 === "embed") {
				var obj: Object;
				args.shift();
				const arg = args.join(" ");
				try {
					obj = JSON.parse(arg);
				} catch (e) {
					message.channel.send(`'${args[1]}'`);
					message.reply(`❌ JSON parsing error : \`${e.message}\``);
					return;
				}
				const embed = new MessageEmbed(this.funcs.get("replaceVariables")(obj, message.author, message.guild, true));
				try {
					await message.channel.send("✅ Set the welcome embed to :", embed);
					if (!(await this.client.db.getWelcome(message.guild)).enabled) {
						await message.channel.send(`**Welcome is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`);
					}
				} catch (e) {
					message.channel.send(`❌ \`${e.message}\`\n Here are the docs of Discord's MessageEmbeds, it may help : https://discord.js.org/#/docs/main/stable/class/MessageEmbed`);
					return;
				}
				this.client.db.setWelcome(message.guild, "value", obj);
				this.client.db.setWelcome(message.guild, "type", "embed");
				return;
			}

			if (arg0 === "message") {
				args.shift();
				const arg = args.join(" ");
				const msg = this.funcs.get("replaceVariables")({ message: arg }, message.author, message.guild, false);
				await this.client.db.setWelcome(message.guild, "value", msg);
				await this.client.db.setWelcome(message.guild, "type", "text");
				await message.channel.send(`✅ Set the welcome message to :\n${msg.message}`);
				if (!(await this.client.db.getWelcome(message.guild)).enabled) {
					await message.channel.send(`**Welcome is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`);
				}
				return;
			}

			if (arg0 === "channel") {
				const channel = Args.parseChannel(args[1], message.guild) as TextChannel;
				if (channel === null) {
					message.channel.send("❌ Can't find channel.");
					return;
				}
				await this.client.db.setWelcome(message.guild, "channel", channel);
				message.channel.send(`✅ Set welcome channel to ${channel.toString()}`);
				return;
			}

			if (arg0 === "logs") {
				var channel: TextChannel;
				if ((channel = Args.parseChannel(args[1], message.guild) as TextChannel) !== null) {
					await this.client.db.setWelcome(message.guild, "logChannel", channel);
					await message.channel.send(`✅ Set join logs channel to ${channel.toString()}`);
					if (!(await this.client.db.getWelcome(message.guild)).logs) {
						await message.channel.send(`**Joins log is disabled.** Do \`${this.client.prefix}${this.name} logs enable\` to enable it.`);
					}
					return;
				}

				if (!(args[1].toLowerCase() === "enable" || args[1].toLowerCase() === "disable")) {
					message.channel.send("❌ Invalid argument.");
					return;
				}
				if ((await this.client.db.getWelcome(message.guild)).logChannel === null) {
					message.channel.send(`❌ Please specify a join logs channel with \`${this.client.prefix}${this.name} logs <channel>\``);
					return;
				}
				const enabled = args[1].toLowerCase() === "enable";
				await this.client.db.setWelcome(message.guild, "logs", enabled);
				message.channel.send(`✅ ${(enabled) ? "Enabled" : "Disabled"} join logs on this server.`);
				return;
			}
			message.channel.send(`❌ Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`);
		});
	}
}