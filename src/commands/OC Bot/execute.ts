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
						this.error("Can't find user.", message.channel);
						return;
					}
				} else if (args[0].toLowerCase() === "at") {
					args.shift();
					channel = parseChannel(args.shift(), message.guild, true, this.client) as TextChannel;
					if (!channel) {
						this.error("Can't find channel", message.channel);
						return;
					}
				}
			}
			if (!channel && !user) {
				this.error("Please specify at least a user or a channel.", message.channel);
				return;
			}
			const name = (args.shift() || "").toLowerCase();
			if (!this.client.commands.has(name) && !this.client.aliases.has(name)) {
				this.error("Can't find command", message.channel);
				return;
			}
			const command: Command = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
			if (command.module === "Social") {
				this.warn("Social commands are likely to fail with oc!execute even if no error is triggered.", message.channel);
			}
			const initialChannel: TextChannel = message.channel as TextChannel;
			const initialAuthor: User = message.author;
			const msg: Message = message;
			if (user) msg.author = user;
			if (channel) msg.channel = channel as TextChannel;
			try {
				await command.exe(msg, args);
				this.success(`Successfully executed command \`${name}\` as **${msg.author.tag}** at **#${(msg.channel as TextChannel).name}**`, initialChannel);
				log.info(`${log.user(initialAuthor)} executed ${log.text(name)} as ${log.user(msg.author)} at ${log.channel(msg.channel as GuildChannel)}`);
			} catch (err) {
				this.error("Execution failed", message.channel, err);
			}
		});
	}
}