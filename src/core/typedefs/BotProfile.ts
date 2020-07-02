import { User } from "discord.js";

export type BotProfileField = "bestie" | "canRep" | "cookies" | "desc" | "rep" | "uses";

export interface BotProfile {
	bestie?: User,
	canRep: boolean,
	cookies: number,
	desc?: string,
	rep: number,
	uses: number,
	user: User
}