import { Message, MessageEmbed, ActivityType, GuildAuditLogs } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "set-activity",
			desc: "Changes bot's Discord activity\nUse with no arguments to clear (Admin only)",
			module: "OC Bot",
			usages: [
				"<PLAYING|STREAMING|LISTENING|WATCHING> <name: String>",
				""
			],
			whitelist: client.admins,
			aliases: ["activity"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const types: string[] = ["PLAYING", "STREAMING", "LISTENING", "WATCHING"]
			const type: ActivityType = (args.shift() || "").toUpperCase() as ActivityType;
			if ((type as string) == "" && args.length < 2) {
				await this.client.user.setActivity();
				log.info(`${log.user(message.author)} cleared bot's activity`);
				message.channel.send("✅ Cleared activity.");
				return;
			}
			if (!types.includes(type)) {
				message.channel.send("❌ Invalid type");
				return;
			}
			var name: string = args.join(" ").trim();
			if (!name) {
				message.channel.send("❌ Please set an activity name");
				return;
			}
			if (type === "LISTENING" && name.toLowerCase().startsWith("to"))
				name = name.slice(3);
			if (type === "STREAMING")
				await this.client.user.setActivity(name, { type: type, url: "https://twitch.tv/theuniqueocbot" });
			else
				await this.client.user.setActivity(name, { type: type });
			message.channel.send(`✅ Set activity to : ${type[0] + type.slice(1).toLocaleLowerCase()} ${(type === "LISTENING") ? "to" : ""} **${name}**`);
			log.info(`${log.user(message.author)} set bot's activity to : ${log.text(type + " " + name)}`);
			return;
		});
	}
}