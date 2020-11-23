import { Message, MessageEmbed, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import * as Args from "../../core/lib/Args";
import { replaceWelcomeVariables } from "../../core/lib/utils";
import { BotResponseEmotes } from "../../core/lib/Constants";
export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "welcome",
			desc: "Manages welcome messages and join logs",
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
				if ((await this.client.db.getWelcome(message.guild)).channel === null) {
					this.error(`Please specify a welcome channel with \`${this.client.prefix}${this.name} channel\``, message.channel);
					return;
				}
				const enabled: boolean = subcommand === "enable";
				await this.client.db.setWelcome(message.guild, "enabled", enabled);
				this.success(`${enabled ? "Enabled" : "Disabled"} welcome on this server.`, message.channel);
				return;
			}

			if (subcommand === "variables" || subcommand === "vars") {
				message.channel.send("You can use following variables in your welcome message : `{SERVER_NAME}`, `{USER_NAME}`, `{USER_MENTION}`\n**Embed only :** `{SERVER_ICON}`, `{USER_AVATAR}`");
				return;
			}

			if (subcommand === "embed") {
				var obj: Object;
				args.shift();
				const arg = args.join(" ");
				try {
					obj = JSON.parse(arg);
				} catch (err) {
					message.channel.send(`'${args[1]}'`);
					this.error("JSON parsing error", message.channel, err);
					return;
				}
				const embed = new MessageEmbed(replaceWelcomeVariables(obj, message.author, message.guild, true));
				try {
					await message.channel.send(BotResponseEmotes.SUCCESS + " Set the welcome embed to :", embed);
					if (!(await this.client.db.getWelcome(message.guild)).enabled) {
						await this.warn(`**Welcome is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`, message.channel);
					}
				} catch (err) {
					this.error("An error occured.\n[Docs of Discord Embeds](https://discord.js.org/#/docs/main/stable/class/MessageEmbed]", message.channel, err);
					return;
				}
				this.client.db.setWelcome(message.guild, "value", obj);
				this.client.db.setWelcome(message.guild, "type", "embed");
				return;
			}

			if (subcommand === "message") {
				args.shift();
				const arg: string = args.join(" ");
				const msg: any = replaceWelcomeVariables({ message: arg }, message.author, message.guild, false);
				await this.client.db.setWelcome(message.guild, "value", arg);
				await this.client.db.setWelcome(message.guild, "type", "text");
				await this.success(`Set the welcome message to :\n${msg.message}`, message.channel);
				if (!(await this.client.db.getWelcome(message.guild)).enabled) {
					await this.warn(`**Welcome is disabled.** Do \`${this.client.prefix}${this.name} enable\` to enable it.`, message.channel);
				}
				return;
			}

			if (subcommand === "channel") {
				const channel: TextChannel = Args.parseChannel(args[1], message.guild) as TextChannel;
				if (channel === null) {
					this.error("Can't find channel.", message.channel);
					return;
				}
				await this.client.db.setWelcome(message.guild, "channel", channel);
				this.success(`Set welcome channel to ${channel.toString()}`, message.channel);
				return;
			}

			if (subcommand === "logs") {
				var channel: TextChannel;
				if ((channel = Args.parseChannel(args[1], message.guild) as TextChannel) !== null) {
					await this.client.db.setWelcome(message.guild, "logChannel", channel);
					await this.success(`Set join logs channel to ${channel.toString()}`, message.channel);
					if (!(await this.client.db.getWelcome(message.guild)).logs) {
						await this.warn(`**Join logs are disabled.** Do \`${this.client.prefix}${this.name} logs enable\` to enable it.`, message.channel);
					}
					return;
				}

				if (!(args[1].toLowerCase() === "enable" || args[1].toLowerCase() === "disable")) {
					this.error("Invalid argument.", message.channel);
					return;
				}
				if ((await this.client.db.getWelcome(message.guild)).logChannel === null) {
					this.error(`Please specify a join logs channel with \`${this.client.prefix}${this.name} logs <channel>\``, message.channel);
					return;
				}
				const enabled: boolean = args[1].toLowerCase() === "enable";
				await this.client.db.setWelcome(message.guild, "logs", enabled);
				this.success(`${(enabled) ? "Enabled" : "Disabled"} join logs on this server.`, message.channel);
				return;
			}
			this.error(`Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`, message.channel);
		});
	}
}