import { Message } from "discord.js";
import Tofu from "../../core/base/Client";
import Command from "../../core/base/Command";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "resume",
			desc: "Resumes song",
			module: "Music",
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async () => {
			this.client.commands.get("play").exe(message, []);
		});
	}
}