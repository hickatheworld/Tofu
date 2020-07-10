import * as cron from "node-cron";
import { yellow } from "chalk";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";
import Giveaway from "../core/typedefs/Giveaway";
import { collectGiveaway } from "../core/lib/utils";
export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "ready", true);
	}

	public async exe() {
		this.client.db.init(false);
		const giveaways: Giveaway[] = await this.client.db.getAllGiveaways(false);
		for (const giveaway of giveaways) {
			log.info(`Catching up [${log.number(giveaway.id)}] ${log.text(giveaway.name)} giveaway.`);
			collectGiveaway(giveaway, this.client.db);
		}
		log.info("Setting up commands");
		this.client.commands.forEach((cmd) => {
			if (cmd.setup)
				cmd.setup();
		});

		log.info(`Bot ready and connected as ${log.user(this.client.user)}`);
		if (this.client.test) {
			console.log(yellow("/!\\ Bot in test mode. All non-admin messages will be ignored /!\\"));
		}

		cron.schedule("* * 0 * * *", () => {
			this.client.db.models.profiles.update({ canRep: true }, { where: { canRep: false } });
			log.info("Reset canRep property for all users.");
		});
	}
}