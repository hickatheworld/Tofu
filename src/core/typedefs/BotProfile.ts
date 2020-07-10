import { User } from "discord.js";

export default interface BotProfile {
	bestie?: User,
	canRep: boolean,
	cookies: number,
	desc?: string,
	rep: number,
	title: string,
	uses: number,
	user: User
}