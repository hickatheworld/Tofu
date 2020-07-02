import { Client, Guild, GuildChannel, GuildMember, Role, Snowflake, User } from "discord.js";

const userMention: RegExp = /<@!?(\d{18,})>/;
const channelMention: RegExp = /<#(\d{18,})>/;
const roleMention: RegExp = /<@&(\d{18,})>/;
const snowflakeDetect: RegExp = /(\d{18,})/;

function parseID(str: string, regex: RegExp): Snowflake | null {
	if (regex.test(str)) {
		return regex.exec(str)[1];
	} else if (snowflakeDetect.test(str)) {
		return snowflakeDetect.exec(str)[1];
	} else return null;
}

export function parseChannel(str: string, guild: Guild): GuildChannel | null {
	if (parseID(str, channelMention) === null) return null;
	const id: Snowflake = parseID(str, channelMention);
	if (!guild.channels.cache.has(id)) return null;
	return guild.channels.cache.get(id);
}

export function parseMember(str: string, guild: Guild): GuildMember | null {
	if (parseID(str, userMention) === null) return null;
	const id: Snowflake = parseID(str, userMention);
	if (!guild.members.cache.has(id)) return null;
	return guild.members.cache.get(id);
}

export function parseRole(str: string, guild: Guild): Role | null {
	if (parseID(str, roleMention) === null) return null;
	const id: Snowflake = parseID(str, channelMention);
	if (!guild.roles.cache.has(id)) return null;
	return guild.roles.cache.get(id);
}

export function parseUser(str: string, client: Client): User | null {
	if (parseID(str, userMention) === null) return null;
	const id: Snowflake = parseID(str, userMention);
	if (!client.users.cache.has(id)) return null;
	return client.users.cache.get(id);
}

export function parseNumber(str: string): number | null {
	if (isNaN(parseInt(str))) return null;
	return parseInt(str);
}