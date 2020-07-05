import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
import { yellow } from "chalk";
import { BotEvent } from "../core/base/BotEvent";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "ready", true);
	}

	public exe() {
		this.client.setOwner();
		this.client.setAdmins();
		this.client.db.init(false);
		log.info(`Bot ready and connected as ${log.user(this.client.user)}`);
		if (this.client.test) {
			console.log(yellow("/!\\ Bot in test mode. All non-admin messages will be ignored /!\\"));
		}
	}
}