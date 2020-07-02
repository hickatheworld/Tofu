import { User } from "discord.js";
import Argument from "./Argument";

export default interface CommandOptions {
	aliases?: string[],
	cooldown?: number,
	desc: string,
	module: string,
	name: string,
	usages?: string[],
	whitelist?: User[]
}