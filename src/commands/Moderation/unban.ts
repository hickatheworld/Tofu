import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message } from "discord.js";
import GuildModerationSettings from "../../core/typedefs/GuildModerationSettings";
import { parseID, userMention } from "../../core/lib/Args";
import { guild } from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "unban",
			desc: "Unbans someone",
			usages: [
				"<user: User> [reason: String]"
			],
			module: "Moderation",
			perms: ["BAN_MEMBERS"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			if (!args[0]) {
				message.channel.send("❌ Please specify an user to unban.");
				return;
			}
			const unbanned: string = parseID(args.shift(), userMention);
			if (!unbanned) {
				message.channel.send("❌ Please specify a correct user to unban");
				return;
			}
			try {
				await message.guild.fetchBan(unbanned);
			} catch (err) {
				if (err.message === "Unknown Ban") {
					message.channel.send("❌ This user isn't banned");
					return;
				}
				message.channel.send(`❌ An error occured : \`${err.toString()}\``);
			}
			const reason: string = args.join(" ").trim() || "No reason provided";
			await this.client.unban(message.guild.id, unbanned, message.author, reason);
			message.channel.send(`🔓 **Unbanned <@${unbanned}>**`);
		});
	}
}