import { Guild, User, Snowflake } from "discord.js";

export default interface Punishment {
	id?: number,
	type: "KICK" | "MUTE" | "BAN" | "UNMUTE" | "UNBAN",
	guild: Guild | Snowflake,
	author: User | Snowflake,
	target: User | Snowflake,
	reason?: string,
	end?: Date
}