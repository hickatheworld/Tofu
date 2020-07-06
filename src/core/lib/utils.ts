import { User, Guild, TextChannel, ReactionCollector, Message, MessageEmbed } from "discord.js";
import Giveaway from "../typedefs/Giveaway";
import DB from "./db";

export function replaceWelcomeVariables(obj: Object, user: User, guild: Guild, embed: boolean): Object {
	var str = JSON.stringify(obj);
	str = str.replace("{SERVER_NAME}", guild.name);
	str = str.replace("{USER_NAME}", user.tag);
	str = str.replace("{USER_MENTION}", user.toString());
	if (embed) str = str.replace("{SERVER_ICON}", guild.iconURL({ dynamic: true }));
	if (embed) str = str.replace("{USER_AVATAR}", user.avatarURL({ dynamic: true }));
	return JSON.parse(str);
}

export function collectGiveaway(ga: Giveaway, db: DB): void {
	if (ga.finished) return;
	const msg: Message = ga.message;
	const collector: ReactionCollector = new ReactionCollector(msg, r => r.emoji.id === "704993375748620338", { dispose: true });
	collector.on("collect", async (_reaction, user) => {
		if (user.bot) return;
		const gaUpdated: Giveaway = await db.addGAParticipating(ga.id, user);
		if (gaUpdated === null) {
			(await user.createDM()).send(`Something went wrong trying to add you in the **${ga.name}** giveaway`);
		}
		const updatedEmbed: MessageEmbed = msg.embeds[0];
		updatedEmbed.fields[2].value = gaUpdated.participating.length.toString();
		msg.edit(updatedEmbed);
	});
	collector.on("remove", async (_reaction, user) => {
		if (user.bot) return;
		const gaUpdated: Giveaway = await db.removeGAParticipating(ga.id, user);
		const updatedEmbed: MessageEmbed = msg.embeds[0];
		updatedEmbed.fields[2].value = gaUpdated.participating.length.toString();
		msg.edit(updatedEmbed);
	});
	const timeLeft: number = ga.end.getTime() - new Date().getTime();
	setTimeout(async () => {
		const finalGA: Giveaway = await db.getGiveaway(ga.id);
		if (finalGA.finished) return;
		var winners: User[] = [];
		for (var i: number = 0; i < finalGA.winnersCount; i++) {
			const index: number = Math.floor(Math.random() * finalGA.participating.length);
			const picked: User = finalGA.participating[index];
			if (picked) winners.push(picked);
			finalGA.participating.splice(index, 1);
		}
		if (winners.length < 1) await finalGA.channel.send(`<:Mina_pout:684265150622072943> Looks like nobody won the **${ga.name}** giveaway...`);
		else await finalGA.channel.send(`🎉 Congratulations to ${winners.map(u => u.toString()).join(", ")} for winning the **${finalGA.name}** giveaway!`);
		finalGA.winners = winners;
		db.finishGiveaway(finalGA.id, finalGA.winners);
	}, timeLeft);
}