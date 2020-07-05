import { Guild, MessageEmbedOptions, TextChannel } from "discord.js";

export type GuildByeField = "channel" | "enabled" | "logs" | "logChannel" | "type" | "value";

export interface GuildBye {
	channel: TextChannel,
	enabled: boolean,
	guild: Guild,
	logs: boolean,
	logChannel: TextChannel
	type: "text" | "embed",
	value: MessageEmbedOptions | { message: string },
}