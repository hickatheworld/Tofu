import { User, Guild } from "discord.js";
import { DiscordBadgesEmotes } from "./Constants";

export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function replaceWelcomeVariables(obj: Object, user: User, guild: Guild, embed: boolean): Object {
	var str = JSON.stringify(obj);
	str = str.replace("{SERVER_NAME}", guild.name);
	str = str.replace("{USER_NAME}", user.tag);
	str = str.replace("{USER_MENTION}", user.toString());
	if (embed) str = str.replace("{SERVER_ICON}", guild.iconURL({ dynamic: true }));
	if (embed) str = str.replace("{USER_AVATAR}", user.avatarURL({ dynamic: true }));
	return JSON.parse(str);
}

export function shuffleArray(arr: Array<any>): Array<any> {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i)
		const temp = arr[i]
		arr[i] = arr[j]
		arr[j] = temp
	}
	return arr;
}

export function capitalize(str: string): string {
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function formatPermission(name: string): string {
	var out: string = "";
	for (const i of name.split("_")) {
		out += i[0].toUpperCase() + i.slice(1).toLowerCase() + " ";
	}
	out = out.replace(/tts/i, "TTS")
	out = out.replace(/Vad/, "Voice Activity Detection")
	return out.slice(0, out.length - 1);
}

export function formatFlag(name: keyof typeof DiscordBadgesEmotes): string {
	return DiscordBadgesEmotes[name];
}