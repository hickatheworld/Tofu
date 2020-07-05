import { User, Guild } from "discord.js";

export function replaceWelcomeVariables(obj: Object, user: User, guild: Guild, embed: boolean): Object {
	var str = JSON.stringify(obj);
	str = str.replace("{SERVER_NAME}", guild.name);
	str = str.replace("{USER_NAME}", user.tag);
	str = str.replace("{USER_MENTION}", user.toString());
	if (embed) str = str.replace("{SERVER_ICON}", guild.iconURL({ dynamic: true }));
	if (embed) str = str.replace("{USER_AVATAR}", user.avatarURL({ dynamic: true }));
	return JSON.parse(str);
}