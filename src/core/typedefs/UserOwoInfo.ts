import { User } from "discord.js";

export default interface UserOwoInfo {
	gotten: string[],
	last: Date,
	streak: number
	user: User
}