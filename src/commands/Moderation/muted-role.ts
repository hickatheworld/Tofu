import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, Role } from "discord.js";
import { parseRole } from "../../core/lib/Args";
import GuildModerationSettings from "../../core/typedefs/GuildModerationSettings";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "muted-role",
			desc: "Sets the muted role on the server",
			usages: [
				"<muted-role: Role>",
				"reset"
			],
			module: "Moderation",
			perms: ["MANAGE_ROLES"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			if (!args[0]) {
				const modSettings: GuildModerationSettings = await this.client.db.getModerationSettings(message.guild);
				const role: Role = modSettings.mutedRole;
				if (role) {
					message.channel.send(`Muted role is set to **${role.name}** on this server.`);
					return;
				} else {
					message.channel.send("No muted role is set on this server or the role has been deleted.");
					return;
				}
			}
			if (args[0].toLowerCase() === "reset") {
				await this.client.db.setModerationSetting(message.guild, "mutedRole", null);
				message.channel.send("✅ Reset muted role on this server.");
				return;
			}
			if (!parseRole(args[0], message.guild)) {
				message.channel.send("❌ Please specify a correct role.");
				return;
			}
			const role: Role = parseRole(args[0], message.guild);
			if (role.position >= message.guild.me.roles.highest.position) {
				message.channel.send("❌ This role is too high in the list for me to control it. Please move it under my highest role.");
				return;
			}
			await this.client.db.setModerationSetting(message.guild, "mutedRole", role);
			message.channel.send(`✅ Set muted role to **${role.name}**.`);
		});
	}
}