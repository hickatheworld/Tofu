import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, MessageEmbed, User, Guild, TextChannel } from "discord.js";
import * as Args from "../../core/lib/Args";
import { replaceWelcomeVariables } from "../../core/lib/utils";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "bye",
			desc: "Manages bye messages and leave logs (Admin only)",
			module: "Server Management",
			usages: [
				"enable/disable",
				"variables",
				"embed <embed: Object>",
				"message <message: String>",
				"channel <channel: Channel>",
				"logs enable/disable",
				"logs <channel: Channel>",
			],
			whitelist: client.admins
		});
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var arg0: string = "";
			if (args[0]) arg0 = args[0].toLowerCase();
			if (arg0 === "enable" || arg0 === "disable") {
				if ((await this.client.db.getBye(message.guild)).channel === null) {
					message.channel.send(`❌ Please specify a bye channel with \`${this.client.prefix}${this.name} channel\``);
					return;
				}
				const enabled: boolean = arg0 === "enable";
				await this.client.db.setBye(message.guild, "enabled", enabled);
				message.channel.send(`✅ ${enabled ? "Enabled" : "Disabled"} bye on this server.`);
				return;
			}

			if (arg0 === "variables" || arg0 === "vars") {
				message.channel.send("You can use following variables in your bye message : `{SERVER_NAME}`, `{USER_NAME}`, `{USER_MENTION}`\n**Embed only :** `{SERVER_ICON}`, `{USER_AVATAR}`");
				return;
			}

			if (arg0 === "embed") {
				var obj: Object;
				args.shift();
				const arg: string = args.join(" ");
				try {
					obj = JSON.parse(arg);
				} catch (e) {
					message.channel.send(`'${args[1]}'`);
					message.reply(`❌ JSON parsing error : \`${e.message}\``);
					return;
				}
				const embed: MessageEmbed = new MessageEmbed(replaceWelcomeVariables(obj, message.author, message.guild, true));
				try {
					await message.channel.send("✅ Set the bye embed to :", embed);
					if (!(await this.client.db.getBye(message.guild)).enabled) {
						await message.channel.send(`**Bye is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`);
					}
				} catch (e) {
					message.channel.send(`❌ \`${e.message}\`\n Here are the docs of Discord's MessageEmbeds, it may help : https://discord.js.org/#/docs/main/stable/class/MessageEmbed`);
					return;
				}
				this.client.db.setBye(message.guild, "value", obj);
				this.client.db.setBye(message.guild, "type", "embed");
				return;
			}

			if (arg0 === "message") {
				args.shift();
				const arg: string = args.join(" ");
				const msg: any = replaceWelcomeVariables({ message: arg }, message.author, message.guild, false);
				await this.client.db.setBye(message.guild, "value", msg);
				await this.client.db.setBye(message.guild, "type", "text");
				await message.channel.send(`✅ Set the bye message to :\n${msg.message}`);
				if (!(await this.client.db.getBye(message.guild)).enabled) {
					await message.channel.send(`**Bye is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`);
				}
				return;
			}

			if (arg0 === "channel") {
				const channel: TextChannel = Args.parseChannel(args[1], message.guild) as TextChannel;
				if (channel === null) {
					message.channel.send("❌ Can't find channel.");
					return;
				}
				await this.client.db.setBye(message.guild, "channel", channel);
				message.channel.send(`✅ Set bye channel to ${channel.toString()}`);
				return;
			}

			if (arg0 === "logs") {
				var channel: TextChannel;
				if ((channel = Args.parseChannel(args[1], message.guild) as TextChannel) !== null) {
					await this.client.db.setBye(message.guild, "logChannel", channel);
					await message.channel.send(`✅ Set leaves logs channel to ${channel.toString()}`);
					if (!(await this.client.db.getBye(message.guild)).logs) {
						await message.channel.send(`**Leave logs are disabled.** Do \`${this.client.prefix}${this.name} logs enable\` to enable it.`);
					}
					return;
				}

				if (!(args[1].toLowerCase() === "enable" || args[1].toLowerCase() === "disable")) {
					message.channel.send("❌ Invalid argument.");
					return;
				}
				if ((await this.client.db.getBye(message.guild)).logChannel === null) {
					message.channel.send(`❌ Please specify a leave logs channel with \`${this.client.prefix}${this.name} logs <channel>\``);
					return;
				}
				const enabled: boolean = args[1].toLowerCase() === "enable";
				await this.client.db.setBye(message.guild, "logs", enabled);
				message.channel.send(`✅ ${(enabled) ? "Enabled" : "Disabled"} leave logs on this server.`);
				return;
			}
			message.channel.send(`❌ Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`);
		});
	}
}