import { Guild, Role, Snowflake, TextChannel } from "discord.js";

export default interface GuildModerationSettings {
	guild: Guild,
	mutedRole?: Role,
	enableDM: boolean,
	modLogsEnabled: boolean,
	modLogsChannel?: TextChannel
}