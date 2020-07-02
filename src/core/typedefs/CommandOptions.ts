import { User } from "discord.js";
import Argument from "./Argument";

export default interface CommandOptions {
	aliases?: string[],
	arguments?: Argument[],
	cooldown?: number,
	desc: string,
	module: string,
	name: string,
	whitelist?: User[]
}