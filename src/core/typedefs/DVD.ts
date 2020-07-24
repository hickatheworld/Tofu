import { Guild } from "discord.js";

export default interface DVD {
	corners: number,
	edges: number,
	guild: Guild,
	x: number,
	xspeed: number,
	y: number,
	yspeed: number
}	