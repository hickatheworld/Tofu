import { Guild } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import OCBot from "../core/base/Client";
import Giveaway from "../core/typedefs/Giveaway";
import * as log from "../core/lib/Log";
export = class extends BotEvent {
	constructor(client: OCBot) {
		super(client, "guildDelete");
	}

	public async exe(guild: Guild): Promise<void> {
		if (!this.client.giveaways.array().map(ga => ga.guild.id).includes(guild.id)) return;
		const giveaways: Giveaway[] = this.client.giveaways.filter(ga => ga.guild.id === guild.id).array();
		for (const ga of giveaways) {
			if (ga.finished) return;
			await this.client.db.models.giveaways.destroy({ where: { id: ga.id } });
			this.client.giveaways.delete(ga.id);
			log.warn(`Giveaway ${log.number(ga.id)} has been cancelled due to guild deletion.`);
			ga.host.send(`The giveaway \`${ga.name}\` (id: ${ga.id}) has been cancelled due to guild deletion.\nProbably happens because I've been removed from there..`);
		}
	}
}