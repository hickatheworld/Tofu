import { Snowflake } from "discord.js";
/**
 * Default emotes are hosted on https://discord.gg/nJjDQGz
 * You must have your bot in the guild you're hosting the emotes at to make it able to use them
 */
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

export const COOKIE_GIVER_ID: Snowflake = "573812128482459648";

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
export enum ProfileEmotes {
	BESTIE = "🙌",
	COOKIES = "🍪",
	REPUTATION = "⬆",
	SERVER_AGE = "⏲",
	TITLE_DEFAULT = "<:dahyunHeart:753971883988353065>"
}

export enum TriviaColors {
	EASY = "BLUE",
	MEDIUM = "GOLD",
	HARD = "RED",
	CORRECT = "GREEN"
}

export const TriviaLetters: string[] = ["🇦", "🇧", "🇨", "🇩"];