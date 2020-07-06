import { Snowflake } from "discord.js";

export default interface CommandOptions {
	aliases?: string[],
	cooldown?: number,
	desc: string,
	module: string,
	name: string,
	usages?: string[],
	whitelist?: Snowflake[]
}