import { ColorResolvable, Snowflake } from "discord.js";
/**
 * Default emotes are hosted on https://discord.gg/nJjDQGz
 * You must have your bot in the guild you're hosting the emotes at to make it able to use them
 */

export enum AlphabetEmotes {
	A = "🇦",
	B = "🇧",
	C = "🇨",
	D = "🇩",
	E = "🇪",
	F = "🇫",
	G = "🇬",
	H = "🇭",
	I = "🇮",
	J = "🇯",
	K = "🇰",
	L = "🇱",
	M = "🇲",
	N = "🇳",
	O = "🇴",
	P = "🇵",
	Q = "🇶",
	R = "🇷",
	S = "🇸",
	T = "🇹",
	U = "🇺",
	V = "🇻",
	W = "🇼",
	X = "🇽",
	Y = "🇾",
	Z = "🇿"
}

export const BLANK_EMOTE: string = "<:blank:754343696631201822>";

export enum BotResponseColors {
	SUCCESS = "GREEN",
	WARNING = "YELLOW",
	ERROR = "RED"
}
export enum BotResponseEmotes {
	SUCCESS = "✅",
	WARNING = "⚠",
	ERROR = "<:rejected:753971493901172762>"
}

export enum DiscordBadgesEmotes {
	DISCORD_EMPLOYEE = "<:discord_employee:753970243025764363>",
	DISCORD_PARTNER = "<:discord_partner:753970243491201134>",
	HYPESQUAD_EVENTS = "<:hypesquad_events:753970243524624454>",
	BUGHUNTER_LEVEL_1 = "<:bughunter_level_1:753970243369697290>",
	BUGHUNTER_LEVEL_2 = "<:bughunter_level_2:753970243340206190>",
	HOUSE_BALANCE = "<:house_balance:753970243168108575>",
	HOUSE_BRAVERY = "<:house_bravery:753970243386343554>",
	HOUSE_BRILLIANCE = "<:house_brilliance:753970243419897916>",
	EARLY_SUPPORTER = "<:early_supporter:753970243298263101>",
	TEAM_USER = "`Team user`",
	SYSTEM = "<:system:753970243839197204>",
	VERIFIED_BOT = "<:verified_bot:753970243277160550>",
	VERIFIED_DEVELOPER = "<:verified_developer:753970243260514428>"
}

export enum DiscordServerIconsEmotes {
	BOOST_LEVEL_1 = "<:boost_1:754321046005350452>",
	BOOST_LEVEL_2 = "<:boost_2:754321046525706260>",
	BOOST_LEVEL_3 = "<:boost_3:754321046412329040>",
	PARTNER = "<:partner:754321046399615026>",
	VERIFIED = "<:verified:754321046118596669>"
}

export const GIVEAWAY_EMOTE: string = "<a:dubuParty:774954454910107659>";
export const GIVEAWAY_EMOTE_ID: string = "774954454910107659";

export const OsuModesEmotes: string[] = ["<:osu_0:781232842360750140>", "<:osu_1:781232842344235028>", "<:osu_2:781232842310549525>", "<:osu_3:781232842037395507>"];
export enum OsuRanksEmotes {
	A = "<:osu_a:781230770445746218>",
	S = "<:osu_s:781230770370904085>",
	SH = "<:osu_sh:781230770768969759>",
	X = "<:osu_x:781230770818777158>",
	XH = "<:osu_xh:781230770785222657>"
}

export enum ProfileEmotes {
	BESTIE = "🙌",
	COOKIES = "🍪",
	OWO = "😙",
	REPUTATION = "⬆",
	SERVER_AGE = "⏲",
	TITLE_DEFAULT = "<:dahyun_heart:753971883988353065>"
}

export const REPUTATION_COLOR: ColorResolvable = "BLUE";

export const REPUTATION_EMOTE: string = "⬆";


export enum ServerInfosEmotes {
	BAN = "<:ban_hammer:754322851099836477>",
	BOOST = "<:boost:754322851036921976>",
	NO_BOOST = "<:no_boost:754322851049504818>",
	ONLINE = "<:online:754325427949928470>",
	OFFLINE = "<:offline:754325427970899999>",
	TEXT_CHANNEL = "<:text_channel:754322850973876235>",
	VOICE_CHANNEL = "<:voice_channel:754322850852372591>"
}

export const SERVER_INFOS_COLOR: ColorResolvable = "BLUE";

export enum ServerRegionsEmotes {
	BRAZIL = "🇧🇷",
	EUROPE = "🇪🇺",
	HONG_KONG = "🇭🇰",
	INDIA = "🇮🇳",
	JAPAN = "🇯🇵",
	RUSSIA = "🇷🇺",
	SINGAPORE = "🇸🇬",
	SOUTH_AFRICA = "🇿🇦",
	SYDNEY = "🇦🇺",
	US_CENTRAL = "🇺🇸",
	US_EAST = "🇺🇸",
	US_SOUTH = "🇺🇸",
	US_WEST = "🇺🇸"
}

export enum TriviaColors {
	EASY = "BLUE",
	MEDIUM = "GOLD",
	HARD = "RED",
	CORRECT = "GREEN"
}

export const TRIVIA_LETTERS: string[] = ["🇦", "🇧", "🇨", "🇩"];