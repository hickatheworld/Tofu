import { Message, MessageEmbed, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import * as Args from "../../core/lib/Args";
import { replaceWelcomeVariables } from "../../core/lib/utils";
import { BotResponseEmotes } from "../../core/lib/Constants";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "bye",
			desc: "Manages bye messages and leave logs",
			module: "Server",
			usages: [
				"enable/disable",
				"variables",
				"embed <embed: Object>",
				"message <message: String>",
				"channel <channel: Channel>",
				"logs enable/disable",
				"logs <channel: Channel>",
			],
			perms: ["MANAGE_GUILD"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var subcommand: string = "";
			if (args[0]) subcommand = args[0].toLowerCase();
			if (subcommand === "enable" || subcommand === "disable") {
				if ((await this.client.db.getBye(message.guild)).channel === null) {
					this.error(`Please specify a bye channel with \`${this.client.prefix}${this.name} channel\``, message.channel);
					return;
				}
				const enabled: boolean = subcommand === "enable";
				await this.client.db.setBye(message.guild, "enabled", enabled);
				this.success(`${enabled ? "Enabled" : "Disabled"} bye on this server.`, message.channel);
				return;
			}

			if (subcommand === "variables" || subcommand === "vars") {
				message.channel.send("You can use following variables in your bye message : `{SERVER_NAME}`, `{USER_NAME}`, `{USER_MENTION}`\n**Embed only :** `{SERVER_ICON}`, `{USER_AVATAR}`");
				return;
			}

			if (subcommand === "embed") {
				var obj: Object;
				args.shift();
				const arg: string = args.join(" ");
				try {
					obj = JSON.parse(arg);
				} catch (err) {
					message.channel.send(`'${args[1]}'`);
					this.error("JSON parsing error", message.channel, err);
					return;
				}
				const embed: MessageEmbed = new MessageEmbed(replaceWelcomeVariables(obj, message.author, message.guild, true));
				try {
					await message.channel.send(BotResponseEmotes.SUCCESS + " Set the bye embed to :", embed);
					if (!(await this.client.db.getBye(message.guild)).enabled) {
						await this.warn(`**Bye is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`, message.channel);
					}
				} catch (err) {
					this.error("An error occured.\n[Docs of Discord Embeds](https://discord.js.org/#/docs/main/stable/class/MessageEmbed]", message.channel, err);
					return;
				}
				this.client.db.setBye(message.guild, "value", obj);
				this.client.db.setBye(message.guild, "type", "embed");
				return;
			}

			if (subcommand === "message") {
				args.shift();
				const arg: string = args.join(" ");
				const msg: any = replaceWelcomeVariables({ message: arg }, message.author, message.guild, false);
				await this.client.db.setBye(message.guild, "value", msg);
				await this.client.db.setBye(message.guild, "type", "text");
				await this.success(`Set the bye message to :\n${msg.message}`, message.channel);
				if (!(await this.client.db.getBye(message.guild)).enabled) {
					await this.warn(`**Bye is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`, message.channel);
				}
				return;
			}

			if (subcommand === "channel") {
				const channel: TextChannel = Args.parseChannel(args[1], message.guild) as TextChannel;
				if (channel === null) {
					this.error("Can't find channel.", message.channel);
					return;
				}
				await this.client.db.setBye(message.guild, "channel", channel);
				this.success(`Set bye channel to ${channel.toString()}`, message.channel);
				return;
			}

			if (subcommand === "logs") {
				var channel: TextChannel;
				if ((channel = Args.parseChannel(args[1], message.guild) as TextChannel) !== null) {
					await this.client.db.setBye(message.guild, "logChannel", channel);
					await this.success(`Set leaves logs channel to ${channel.toString()}`, message.channel);
					if (!(await this.client.db.getBye(message.guild)).logs) {
						await this.warn(`**Leave logs are disabled.** Do \`${this.client.prefix}${this.name} logs enable\` to enable it.`, message.channel);
					}
					return;
				}

				if (!(args[1].toLowerCase() === "enable" || args[1].toLowerCase() === "disable")) {
					this.error("Invalid argument.", message.channel);
					return;
				}
				if ((await this.client.db.getBye(message.guild)).logChannel === null) {
					this.error(`Please specify a leave logs channel with \`${this.client.prefix}${this.name} logs <channel>\``, message.channel);
					return;
				}
				const enabled: boolean = args[1].toLowerCase() === "enable";
				await this.client.db.setBye(message.guild, "logs", enabled);
				this.success(`${(enabled) ? "Enabled" : "Disabled"} leave logs on this server.`, message.channel);
				return;
			}
			this.error(`Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`, message.channel);
		});
	}
}