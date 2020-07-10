import { Guild, MessageEmbedOptions, TextChannel } from "discord.js";

export default interface GuildBye {
	channel: TextChannel,
	enabled: boolean,
	guild: Guild,
	logs: boolean,
	logChannel: TextChannel
	type: "text" | "embed",
	value: MessageEmbedOptions | { message: string },
}