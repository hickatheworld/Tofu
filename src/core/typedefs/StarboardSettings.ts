import { TextChannel, Guild } from "discord.js";

export default interface StarboardSettings {
	enabled: boolean,
	channel?: TextChannel,
	guild: Guild
}