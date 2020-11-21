import { Message } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import BotProfile from "../../core/typedefs/BotProfile";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "unbestie",
			desc: "To break up with your best friend... How tragic",
			module: "Social",
		});
	}

	public async setup() { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const profile: BotProfile = await this.client.db.getProfile(message.author);
			if (!profile.bestie) {
				this.error("You don't even have a bestie...", message.channel);
				return;
			}
			await this.client.db.setUser(message.author, "bestie", null);
			await this.client.db.setUser(profile.bestie, "bestie", null);
			log.info(`${log.user(message.author)} unbestied ${log.user(profile.bestie)}.`);
			this.success("You are now free again!", message.channel);
		});
	}
}