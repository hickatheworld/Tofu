import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import BotProfile from "../../core/typedefs/BotProfile";
import { Message } from "discord.js";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "unbestie",
			desc: "To break up with your best friend... How tragic",
			module: "Social",
		});
	}

	public async setup() {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const profile: BotProfile = await this.client.db.getProfile(message.author);
			if (!profile.bestie) {
				message.channel.send("❌ You don't even have a bestie...");
				return;
			}
			await this.client.db.setUser(message.author, "bestie", null);
			await this.client.db.setUser(profile.bestie, "bestie", null);
			message.channel.send("✅ You are now free again!");
		});
	}
}