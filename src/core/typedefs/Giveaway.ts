import { Guild, GuildChannel, GuildMember, GuildMemberResolvable, Message, User } from "discord.js";

export default interface Giveaway {
	end: Date,
	channel: GuildChannel,
	finished: boolean,
	guild: Guild,
	host: User,
	id?: number,
	message?: Message,
	name: string,
	winCount: number,
	winners?: (GuildMember | GuildMemberResolvable)[]
}