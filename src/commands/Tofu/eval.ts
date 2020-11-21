import { Message } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "eval",
			desc: "Executes a Javascript expression (HickER only)",
			module: "Tofu",
			usages: [
				"<expression: String>"
			],
			aliases: ["js"],
			whitelist: [client.owner]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const expression: string = args.join(" ");
			try {
				const res: any = await eval(expression);
				if (res) message.channel.send(`\`${(res.toString) ? res.toString() : res}\``);
				else message.channel.send("Expression executed with no error");
			} catch (e) {
				message.channel.send(`\`${e.toString()}\``);
			}
		});
	}
}