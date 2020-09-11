import { Message, User } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";
import * as log from "../../core/lib/Log";
import { rejects } from "assert";


export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "cookie",
			desc: "Get yourself offered a cookie by our official cookie giver",
			module: "Social",
			usages: [
				"<user: User> [reason: String]"
			]
		});
	}

	public async setup(): Promise<void> {
		this.props.set("giver", this.client.users.cache.get("573812128482459648"));
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const giver: User = this.props.get("giver");
			if (message.author !== giver) {
				this.error(`Only ${giver.username} can give cookies here.`, message.channel);
				return;
			}
			const cookied: User = parseUser(args.shift(), this.client);
			if (!cookied) {
				this.error("Please specify someone to give a cookie to", message.channel);
				return;
			}
			if (cookied.bot) {
				this.error("You can't give a cookie to a bot..", message.channel);
			}
			if (cookied === message.author) {
				this.error("Self-giving..?", message.channel);
				return;
			}
			const cookies: number = (await this.client.db.getProfile(cookied)).cookies + 1;
			await this.client.db.setUser(cookied, "cookies", cookies);
			const reason: string = args.join(" ").trim();
			message.channel.send(`🍪 ${message.author.toString()}, I gave a cookie to ${cookied.toString()}! 🍪\n${(reason) && `**Reason** : ${reason}`}`);
			log.info(`${log.user(giver)} gave a cookie to ${log.user(cookied)} ${(reason) && `with reason : ${log.text(reason)}`}`);
		});
	}
}