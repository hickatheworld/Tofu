import { yellow } from "chalk";
import { ActivityType } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import Tofu from "../core/base/Client";
import * as log from "../core/lib/Log";
export = class extends BotEvent {
	constructor(client: Tofu) {
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
		const act: string = process.env.BOT_ACTIVITY;
		if (!act) return;
		const actType: ActivityType = ((["PLAYING", "STREAMING", "LISTENING", "WATCHING"].includes(process.env.BOT_ACTIVITY_TYPE)) ? process.env.BOT_ACTIVITY_TYPE : "PLAYING") as ActivityType;
		if (actType === "STREAMING") {
			this.client.user.setActivity(act, { type: actType, url: "https://twitch.tv/Hickacou" });
		} else {
			this.client.user.setActivity(act, { type: actType });
		}
	}
}