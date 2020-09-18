import { GuildMember } from "discord.js";

export default interface MusicQueueItem {
	imgUrl: string,
	url: string,
	requestedBy: GuildMember,
	title: string
}