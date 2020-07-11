import { Message, User, TextChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "execute",
			desc: "Executes a command as another user (Admin only)",
			module: "OC Bot",
			usages: [
				"<user: User> <command: String> [arguments: ...String]"
			],
			aliases: ["exe"],
			whitelist: client.admins
		});
	}

	public async setup(): Promise<void> {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			const user: User = parseUser(args.shift(), this.client);
			if (!user || !message.guild.members.cache.get(user.id)) {
				message.channel.send("❌ Can't find user or user is not in this guild.");
				return;
			}
			const execArgs: string[] = args;
			const execCmd: string = execArgs.shift().toLowerCase();
			const execMsg: Message = new Message(this.client, {}, message.channel as TextChannel);
			execMsg.author = user;
			execMsg.content = `${this.client.prefix}${execCmd} ${execArgs.join(" ")}`;
			if (this.client.commands.has(execCmd)) this.client.commands.get(execCmd).exe(execMsg, execArgs);
			else if (this.client.aliases.has(execCmd)) this.client.commands.get(this.client.aliases.get(execCmd)).exe(execMsg, execArgs);
			else message.channel.send("❌ Can't find command");
		});
	}
}