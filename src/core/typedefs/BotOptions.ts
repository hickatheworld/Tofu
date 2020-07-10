import { Snowflake } from "discord.js";

export default interface BotOptions {
	admins: Snowflake[],
	description: string,
	name: string,
	owner: Snowflake,
	prefix: string,
	test?: boolean
	token: string,
}