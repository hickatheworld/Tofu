import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
import { yellow } from "chalk";
import { BotEvent } from "../core/base/BotEvent";
import Giveaway from "../core/typedefs/Giveaway";
import { collectGiveaway } from "../core/lib/utils";

export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "ready", true);
	}

	public async exe() {
		this.client.db.init(false);
		log.info(`Bot ready and connected as ${log.user(this.client.user)}`);
		if (this.client.test) {
			console.log(yellow("/!\\ Bot in test mode. All non-admin messages will be ignored /!\\"));
		}

		const giveaways: Giveaway[] = await this.client.db.getAllGiveaways(false);
		for (const giveaway of giveaways) {
			log.info(`Catching up [${log.number(giveaway.id)}] ${log.text(giveaway.name)} giveaway.`);
			collectGiveaway(giveaway, this.client.db);
		}

	}
}