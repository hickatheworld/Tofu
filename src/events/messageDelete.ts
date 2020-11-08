import { Message } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import Giveaway from "../core/typedefs/Giveaway";
import * as log from "../core/lib/Log";
export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "messageDelete");
	}

	public async exe(message: Message): Promise<void> {
		var ga: Giveaway;
		if (!this.client.giveaways.array().map(ga => (ga.message) ? ga.message.id : null).includes(message.id)) return;
		ga = this.client.giveaways.find(ga => (ga.message) ? ga.message.id === message.id : false);
		if (ga.finished) return;
		await this.client.db.models.giveaways.destroy({ where: { id: ga.id } });
		this.client.giveaways.delete(ga.id);
		log.warn(`Giveaway ${log.number(ga.id)} has been cancelled due to message deletion.`);
		ga.host.send(`The giveaway \`${ga.name}\` (id: ${ga.id}) has been cancelled due to message deletion. (the message the members have to react to)`);
	}
}