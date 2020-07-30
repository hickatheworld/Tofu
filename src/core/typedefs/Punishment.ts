import { Guild, User } from "discord.js";

export default interface Punishment {
	type: "KICK" | "MUTE" | "BAN" | "UNMUTE" | "UNBAN",
	guild: Guild,
	author: User,
	target: User,
	reason?: string,
	end?: Date
}