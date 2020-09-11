import { Message, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import StarboardSettings from "../../core/typedefs/StarboardSettings";
import { parseChannel } from "../../core/lib/Args";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "starboard",
			desc: "Manages server starboard",
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
					this.error(`Please specify a starboard channel with \`${this.client.prefix}${this.name} channel\``, message.channel);
					return;
				}
				await this.client.db.setStarboard(message.guild, "enabled", enabled);
				this.success(`${(enabled) ? "Enabled" : "Disabled"} starboard on this server.`, message.channel);
				return;
			}
			if (subcommand === "channel") {
				const channel: TextChannel = parseChannel(args.shift(), message.guild) as TextChannel;
				if (!channel) {
					this.error("Incorrect channel.", message.channel);
					return;
				}
				await this.client.db.setStarboard(message.guild, "channel", channel);
				this.success(`Set starboard channel to **#${channel.name}**`, message.channel);
				return;
			}
			this.error(`Invalid argument. Do \`${this.client.prefix}help ${this.name}\` for more informations.`, message.channel);
		});
	}
}