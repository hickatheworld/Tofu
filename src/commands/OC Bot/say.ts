import { Message, TextChannel, GuildChannel } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseChannel } from "../../core/lib/Args";
import * as log from "../../core/lib/Log";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "say",
			desc: "Makes the bot say something",
			module: "OC Bot",
			usages: [
				"<message: String>",
				"<channel: Channel> <message: String>"
			],
			whitelist: client.admins
		});

	}

	public async setup(): Promise<void> {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var content: string;
			var msg: Message;
			if (message.deletable) message.delete();
			if (!parseChannel(args[0], message.guild) || parseChannel(args[0], message.guild).type !== "text") {
				content = args.join(" ");
				msg = await message.channel.send(content);
			} else {
				const channel: TextChannel = parseChannel(args[0], message.guild) as TextChannel;
				args.shift();
				content = args.join(" ");
				msg = await channel.send(content);
			}
			log.info(`${log.user(message.author)} used bot to say ${log.text(msg.content)} in ${log.channel(msg.channel as GuildChannel)}`);
		});
	}
}