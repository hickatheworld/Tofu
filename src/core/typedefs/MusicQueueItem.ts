import { GuildMember } from "discord.js";

export default interface MusicQueueItem {
	channelLink: string,
	channelName: string,
	displayDuration: string,
	duration: number,
	live: boolean,
	imgUrl: string,
	url: string,
	requestedBy: GuildMember,
	title: string
}