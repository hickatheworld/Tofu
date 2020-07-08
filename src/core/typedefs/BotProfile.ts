import { User } from "discord.js";

export type BotProfileField = "bestie" | "canRep" | "cookies" | "desc" | "rep" | "title" | "uses";

export interface BotProfile {
	bestie?: User,
	canRep: boolean,
	cookies: number,
	desc?: string,
	rep: number,
	title: string,
	uses: number,
	user: User
}