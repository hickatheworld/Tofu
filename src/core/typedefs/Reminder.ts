import { Guild, TextChannel, User } from "discord.js";

export default interface Reminder {
	channel: TextChannel,
	guild: Guild,
	reminder: string,
	user: User,
	when: Date
}