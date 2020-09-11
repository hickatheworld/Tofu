import { Message, User, TextChannel, GuildChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser, parseChannel } from "../../core/lib/Args";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "execute",
			desc: "Executes a command in specific conditions (Admin only)",
			module: "OC Bot",
			usages: [
				"<[as <user: User>] [at <channel: Channel>]> <command: String> [argument: ...String]"
			],
			aliases: ["exe"],
			whitelist: client.admins
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var user: User;
			var channel: TextChannel;
			for (var i = 0; i < 2; i++) {
				if (args[0].toLowerCase() === "as") {
					args.shift();
					user = parseUser(args.shift(), this.client);
					if (!user) {
						message.channel.send("❌ Can't find user.");
						return;
					}
				} else if (args[0].toLowerCase() === "at") {
					args.shift();
					channel = parseChannel(args.shift(), message.guild, true, this.client) as TextChannel;
					if (!channel) {
						message.channel.send("❌ Can't find channel");
						return;
					}
				}
			}
			if (!channel && !user) {
				message.channel.send("❌ Please specify at least a user or a channel.");
				return;
			}
			const name = (args.shift() || "").toLowerCase();
			if (!this.client.commands.has(name) && !this.client.aliases.has(name)) {
				message.channel.send("❌ Can't find command");
				return;
			}
			const command: Command = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
			if (command.module === "Social") {
				message.channel.send("⚠ Social commands are likely to fail with oc!execute even if no error is triggered.");
			}
			const initialChannel: TextChannel = message.channel as TextChannel;
			const initialAuthor: User = message.author;
			const msg: Message = message;
			if (user) msg.author = user;
			if (channel) msg.channel = channel as TextChannel;
			try {
				await command.exe(msg, args);
				initialChannel.send(`✅ Successfully executed command \`${name}\` as **${msg.author.tag}** at **#${(msg.channel as TextChannel).name}**`);
				log.info(`${log.user(initialAuthor)} executed ${log.text(name)} as ${log.user(msg.author)} at ${log.channel(msg.channel as GuildChannel)}`);
			} catch (err) {
				message.channel.send("❌ Execution failed.\n```" + err.message + "```");
			}
		});
	}
}