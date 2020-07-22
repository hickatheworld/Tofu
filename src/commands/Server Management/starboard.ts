import { Message, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import StarboardSettings from "../../core/typedefs/StarboardSettings";
import { parseChannel } from "../../core/lib/Args";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "starboard",
			desc: "Manages server starboard (Admin only)",
			module: "Server Management",
			usages: [
				"enable/disable",
				"channel <channel: Channel>"
			],
			aliases: ["star","sb"],
			perms: ["MANAGE_CHANNELS"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var subcommand: string = "";
			if (args[0]) subcommand = args.shift().toLowerCase();
			if (subcommand === "enable" || subcommand === "disable") {
				const enabled: boolean = (subcommand === "enable");
				const sb: StarboardSettings = await this.client.db.getStarboard(message.guild);
				if (enabled && !sb.channel) {
					message.channel.send(`❌ Please specify a starboard channel with \`${this.client.prefix}${this.name} channel\``);
					return;
				}
				await this.client.db.setStarboard(message.guild, "enabled", enabled);
				message.channel.send(`✅ ${(enabled) ? "Enabled" : "Disabled"} starboard on this server.`);
				return;
			}
			if (subcommand === "channel") {
				const channel: TextChannel = parseChannel(args.shift(), message.guild) as TextChannel;
				if (!channel) {
					message.channel.send(`❌ Incorrect channel.`);
					return;
				}
				await this.client.db.setStarboard(message.guild, "channel", channel);
				message.channel.send(`✅ Set starboard channel to **#${channel.name}**`);
				return;
			}
			message.channel.send(`❌ Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`);
		});
	}
}