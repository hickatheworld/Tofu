import { TextChannel, User, Message } from "discord.js";

export default interface Giveaway {
	channel: TextChannel,
	host: User,
	end: Date,
	finished: boolean,
	message: Message,
	name: string,
	id: number,
	participating: User[],
	winners?: User[],
	winnersCount: number,
}