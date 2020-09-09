import { yellow } from "chalk";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "ready", true);
	}

	public async exe() {
		this.client.db.init(false);
		log.info("Setting up commands");
		this.client.commands.forEach((cmd) => {
			if (cmd.setup)
				cmd.setup();
		});

		log.info(`Bot ready and connected as ${log.user(this.client.user)}`);
		if (this.client.test) {
			console.log(yellow("/!\\ Bot in test mode. All non-admin messages will be ignored /!\\"));
		}
		this.client.user.setActivity({
			type: "PLAYING",
			name: `intolerable stupidity`
		});
	}
}