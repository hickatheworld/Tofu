import { DMChannel, GuildChannel } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import Giveaway from "../core/typedefs/Giveaway";
import * as log from "../core/lib/Log";
export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "channelDelete");
	}

	public async exe(channel: GuildChannel | DMChannel): Promise<void> {
		if (!this.client.giveaways.array().map(ga => (ga.channel) ? ga.channel.id : null).includes(channel.id)) return;
		const giveaways: Giveaway[] = this.client.giveaways.filter(ga => (ga.channel) ? ga.channel.id === channel.id : false).array();
		for (const ga of giveaways) {
			if (ga.finished) return;
			await this.client.db.models.giveaways.destroy({ where: { id: ga.id } });
			this.client.giveaways.delete(ga.id);
			log.warn(`Giveaway ${log.number(ga.id)} has been cancelled due to channel deletion.`);
			ga.host.send(`The giveaway \`${ga.name}\` (id: ${ga.id}) has been cancelled due to channel deletion.`);
		}
	}
}