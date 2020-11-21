import { Message, ActivityType } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "set-activity",
			desc: "Changes bot's Discord activity\nUse with no arguments to clear (Admin only)",
			module: "Tofu",
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
				this.success("Cleared activity.", message.channel);
				return;
			}
			if (!types.includes(type)) {
				this.error("Invalid type", message.channel);
				return;
			}
			var name: string = args.join(" ").trim();
			if (!name) {
				this.error("Please set an activity name", message.channel);
				return;
			}
			if (type === "LISTENING" && name.toLowerCase().startsWith("to"))
				name = name.slice(3);
			if (type === "STREAMING")
				await this.client.user.setActivity(name, { type: type, url: "https://twitch.tv/Hickacou" });
			else
				await this.client.user.setActivity(name, { type: type });
			this.success(`Set activity to : ${type[0] + type.slice(1).toLocaleLowerCase()} ${(type === "LISTENING") ? "to" : ""} **${name}**`, message.channel);
			log.info(`${log.user(message.author)} set bot's activity to : ${log.text(type + " " + name)}`);
			return;
		});
	}
}