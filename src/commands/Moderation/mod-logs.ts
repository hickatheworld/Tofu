import { Message, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import GuildModerationSettings from "../../core/typedefs/GuildModerationSettings";
import { parseChannel } from "../../core/lib/Args";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "mod-logs",
			desc: "Manages moderation logs",
			usages: [
				"enable/disable",
				"channel <channel: Channel>",
				"dm <enable/disable>"
			],
			module: "Moderation",
			perms: ["MANAGE_GUILD"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const settings: GuildModerationSettings = await this.client.db.getModerationSettings(message.guild);
			var subcommand = args.shift();
			if (subcommand) subcommand = subcommand.toLowerCase();
			if (subcommand === "enable" || subcommand === "disable") {
				const enabled: boolean = (subcommand === "enable");
				if (!settings.modLogsChannel && enabled) {
					message.channel.send(`❌ You must set a logs channel using \`${this.client.prefix}${this.name} channel\` before enabling mod logs.`);
					return;
				}
				this.client.db.setModerationSetting(message.guild, "modLogsEnabled", enabled);
				message.channel.send(`✅ ${enabled ? "Enabled" : "Disabled"} mod logs in this server.`);
				return;
			}
			if (subcommand === "channel") {
				const channel: TextChannel = parseChannel(args[0], message.guild) as TextChannel;
				if (!channel) {
					message.channel.send("❌ Please specify a correct channel.");
					return;
				}
				await this.client.db.setModerationSetting(message.guild, "modLogsChannel", channel);
				message.channel.send(`✅ Set moderation logs channel to **#${channel.name}**`);
				return;
			}
			if (subcommand === "dm") {
				if (args[0].toLocaleLowerCase() !== "enable" || args[0].toLocaleLowerCase() !== "disable") {
					message.channel.send(`❌ Incorrect arguments.\n\`Correct usage: ${this.client.prefix}${this.name} dm <enabled/disable>\``);
					return;
				}
				const enabled: boolean = (args[0].toLowerCase() === "enable");
				this.client.db.setModerationSetting(message.guild, "enableDM", enabled);
				message.channel.send(`✅ ${enabled ? "Enabled" : "Disabled"} DM logs for this server.`);
				return;
			}
			message.channel.send(`❌ Invalid subcommand. Use \`${this.client.prefix}help ${this.name}\` for more informations.`);
		});
	}
}