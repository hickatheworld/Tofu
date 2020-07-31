import * as Sq from "sequelize";
import { User, Guild, TextChannel, Message } from "discord.js";
import OCBot from "../base/Client";
import * as log from "./Log";
import BotProfile from "../typedefs/BotProfile";
import GuildWelcome from "../typedefs/GuildWelcome";
import GuildBye from "../typedefs/GuildBye";
import Giveaway from "../typedefs/Giveaway";
import StarboardSettings from "../typedefs/StarboardSettings";
import DVD from "../typedefs/DVD";
import { randomInt } from "./utils";
import Punishment from "../typedefs/Punishment";
import GuildModerationSettings from "../typedefs/GuildModerationSettings";
require("dotenv").config();

export default class DB extends Sq.Sequelize {
	private client: OCBot;
	constructor(client: OCBot) {
		super("OCBot", null, null, {
			dialect: "sqlite",
			logging: false,
			storage: "db.sqlite"
		});
		this.client = client;
	}

	public init(force: boolean = false) {
		this.define("profiles", {
			user: {
				type: Sq.STRING,
				unique: true
			},
			title: {
				type: Sq.STRING,
				defaultValue: "<:dubuSaranghae:687377533074931782> Bot user"
			},
			desc: {
				type: Sq.STRING,
				allowNull: true
			},
			canRep: {
				type: Sq.BOOLEAN,
				allowNull: false,
				defaultValue: true
			},
			bestie: {
				type: Sq.STRING,
				allowNull: true
			},
			rep: {
				type: Sq.INTEGER,
				defaultValue: 0,
				allowNull: false
			},
			cookies: {
				type: Sq.INTEGER,
				defaultValue: 0,
				allowNull: false
			},
			uses: {
				type: Sq.INTEGER,
				defaultValue: 0,
				allowNull: false
			}
		}).sync({ force: force });
		this.define("commandUses", {
			name: {
				type: Sq.STRING,
				unique: true,
				allowNull: false
			},
			count: {
				type: Sq.NUMBER,
				allowNull: false,
				defaultValue: 0
			}
		}).sync({ force: force });
		this.define("welcomes", {
			guild: {
				type: Sq.STRING,
				unique: true,
				allowNull: false
			},
			enabled: {
				type: Sq.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			channel: {
				type: Sq.STRING
			},
			type: {
				type: Sq.STRING,
				defaultValue: "text",
				allowNull: false
			},
			value: {
				type: Sq.JSON,
				defaultValue: { message: "Welcome to {SERVER_NAME}}, {USER_MENTION} !" },
				allowNull: false,
			},
			logs: {
				type: Sq.BOOLEAN,
				defaultValue: false,
				allowNull: false
			},
			logChannel: {
				type: Sq.STRING
			}
		}).sync({ force: force });
		this.define("byes", {
			guild: {
				type: Sq.STRING,
				unique: true,
				allowNull: false
			},
			enabled: {
				type: Sq.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			channel: {
				type: Sq.STRING
			},
			type: {
				type: Sq.STRING,
				defaultValue: "text",
				allowNull: false
			},
			value: {
				type: Sq.JSON,
				defaultValue: { message: "Goodbye, {USER_NAME}." },
				allowNull: false,
			},
			logs: {
				type: Sq.BOOLEAN,
				defaultValue: false,
				allowNull: false
			},
			logChannel: {
				type: Sq.STRING
			}
		}).sync({ force: force });
		this.define("giveaways", {
			channel: {
				type: Sq.STRING,
				allowNull: false
			},
			message: {
				type: Sq.STRING,
				allowNull: false
			},
			name: {
				type: Sq.STRING,
				allowNull: false
			},
			end: {
				type: Sq.DATE,
				allowNull: false
			},
			participating: {
				type: Sq.STRING
			},
			winnersCount: {
				type: Sq.NUMBER,
				allowNull: false
			},
			winners: {
				type: Sq.STRING
			},
			finished: {
				type: Sq.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			host: {
				type: Sq.STRING,
				allowNull: false
			}

		}).sync({ force: force });
		this.define("starboards", {
			enabled: {
				type: Sq.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			channel: {
				type: Sq.STRING
			},
			guild: {
				type: Sq.STRING,
				allowNull: false
			}
		}).sync({ force: force });
		this.define("dvd", {
			corners: {
				type: Sq.INTEGER,
				allowNull: false
			},
			edges: {
				type: Sq.INTEGER,
				allowNull: false
			},
			guild: {
				type: Sq.STRING,
				allowNull: false
			},
			x: {
				type: Sq.INTEGER,
				allowNull: false
			},
			xspeed: {
				type: Sq.INTEGER,
				allowNull: false
			},
			y: {
				type: Sq.INTEGER,
				allowNull: false
			},
			yspeed: {
				type: Sq.INTEGER,
				allowNull: false
			}
		}).sync({ force: force });
		this.define("punishments", {
			guild: {
				type: Sq.STRING,
				allowNull: false
			},
			type: {
				type: Sq.STRING,
				allowNull: false
			},
			author: {
				type: Sq.STRING,
				allowNull: false
			},
			target: {
				type: Sq.STRING,
				allowNull: false,
			},
			reason: {
				type: Sq.STRING
			},
			end: {
				type: Sq.DATE
			}
		}).sync({ force: force });
		this.define("moderationSettings", {
			guild: {
				type: Sq.STRING,
				allowNull: false
			},
			mutedRole: {
				type: Sq.STRING
			},
			enableDM: {
				type: Sq.BOOLEAN
			},
			modLogsEnabled: {
				type: Sq.BOOLEAN
			},
			modLogsChannel: {
				type: Sq.STRING
			},
		}).sync({force: force});
		log.info("Defined Sequelize models");
	}

	async createProfile(user: User): Promise<BotProfile> {
		const model = this.model("profiles");
		const snowflake = user.id;
		await model.create({
			user: snowflake
		});
		log.info(`Generated profile for ${log.user(user)}`);
		return {
			bestie: null,
			canRep: true,
			cookies: 0,
			desc: null,
			rep: 0,
			title: "<:dubuSaranghae:687377533074931782> Bot user",
			uses: 0,
			user: user
		};
	}

	async getProfile(user: User): Promise<BotProfile> {
		var profile: Sq.Model = await this.models.profiles.findOne({ where: { user: user.id } });
		if (profile === null) {
			return this.createProfile(user);
		}
		const obj: any = profile.toJSON();
		return {
			bestie: this.client.users.cache.get(obj.bestie) ?? null,
			canRep: obj.canRep,
			cookies: obj.cookies,
			desc: obj.desc,
			rep: obj.rep,
			title: obj.title,
			uses: obj.uses,
			user: user
		};
	}

	async setUser(user: User, key: keyof BotProfile, value: any): Promise<BotProfile> {
		const profile: any = await this.getProfile(user);
		profile[key] = value;
		const obj: any = {};
		if (key === "bestie") obj[key] = (value) ? value.id : null;
		else obj[key] = value;
		await this.models.profiles.update(obj, { where: { user: user.id } });

		if (typeof value === "number") log.info(`Set ${log.text(key)} to ${log.number(value)} for ${log.user(user)}`);
		else if (value instanceof User) log.info(`Set ${log.text(key)} to ${log.user(value)} for ${log.user(user)}`);
		else log.info(`Set ${log.text(key)} to ${log.text(value)} for ${log.user(user)}`);
		return profile;
	}

	async incrementUser(user: User): Promise<number> {
		const uses: number = (await this.getProfile(user)).uses + 1
		this.setUser(user, "uses", uses);
		return uses;
	}

	async setCommandUses(name: string, count: number): Promise<number> {
		await this.getCommandUses(name);
		await this.models.commandUses.update({ count: count }, { where: { name: name } });
		log.info(`Set ${log.text(name)} command uses to ${log.number(count)}`);
		return count;
	}

	async getCommandUses(name: string): Promise<number> {
		const command: Sq.Model = await this.models.commandUses.findOne({ where: { name: name } });
		if (command === null) {
			this.models.commandUses.create({
				name: name,
				value: 0
			});
			return 0;
		}
		return (command.toJSON() as { name: string, count: number }).count;
	}

	async incrementCommand(name: string): Promise<number> {
		const old: number = await this.getCommandUses(name);
		const count: number = await this.setCommandUses(name, old + 1);
		return count;
	}

	async createWelcome(guild: Guild): Promise<GuildWelcome> {
		await this.models.welcomes.create({
			guild: guild.id
		});
		log.info(`Created row in ${log.text("welcome")} table for guild ${log.guild(guild)}`);
		return {
			channel: null,
			enabled: false,
			guild: guild,
			logs: null,
			logChannel: null,
			type: "text",
			value: null
		};
	}

	async getWelcome(guild: Guild): Promise<GuildWelcome> {
		const welcome: Sq.Model = await this.models.welcomes.findOne({ where: { guild: guild.id } });
		if (welcome === null) {
			return this.createWelcome(guild);
		}
		const obj: any = welcome.toJSON();
		return {
			channel: this.client.channels.cache.get(obj.channel) as TextChannel ?? null,
			enabled: obj.enabled,
			guild: this.client.guilds.cache.get(obj.guild),
			logs: obj.logs,
			logChannel: this.client.channels.cache.get(obj.logChannel) as TextChannel ?? null,
			type: obj.type,
			value: obj.value
		}
	}

	async setWelcome(guild: Guild, key: keyof GuildWelcome, value: any): Promise<GuildWelcome> {
		const welcome: any = await this.getWelcome(guild);
		welcome[key] = value;
		const obj: any = {};
		if (key === "channel" || key === "logChannel") obj[key] = value.id;
		else obj[key] = value;
		await this.models.welcomes.update(obj, { where: { guild: guild.id } });
		if (typeof value === "boolean") log.info(`Set welcome ${log.text(key)} to ${log.bool(value)} for ${log.guild(guild)}`);
		else if (value instanceof TextChannel) log.info(`Set welcome ${log.text(key)} to ${log.channel(value)} for ${log.guild(guild)}`);
		else log.info(`Set welcome ${log.text(key)} to ${log.text(value.toString())} for ${log.guild(guild)}`);
		return welcome;
	}

	async createBye(guild: Guild): Promise<GuildBye> {
		await this.models.byes.create({
			guild: guild.id
		});
		log.info(`Created row in ${log.text("byes")} table for guild ${log.guild(guild)}`);
		return {
			channel: null,
			enabled: false,
			guild: guild,
			logs: null,
			logChannel: null,
			type: "text",
			value: null
		};
	}

	async getBye(guild: Guild): Promise<GuildBye> {
		const bye: Sq.Model = await this.models.byes.findOne({ where: { guild: guild.id } });
		if (bye === null) {
			return this.createBye(guild);
		}
		const obj: any = bye.toJSON();
		return {
			channel: this.client.channels.cache.get(obj.channel) as TextChannel ?? null,
			enabled: obj.enabled,
			guild: this.client.guilds.cache.get(obj.guild),
			logs: obj.logs,
			logChannel: this.client.channels.cache.get(obj.logChannel) as TextChannel ?? null,
			type: obj.type,
			value: obj.value
		}
	}

	async setBye(guild: Guild, key: keyof GuildBye, value: any): Promise<GuildBye> {
		const bye: any = await this.getBye(guild);
		bye[key] = value;
		const obj: any = {};
		if (key === "channel" || key === "logChannel") obj[key] = value.id;
		else obj[key] = value;
		await this.models.byes.update(obj, { where: { guild: guild.id } });
		if (typeof value === "boolean") log.info(`Set bye ${log.text(key)} to ${log.bool(value)} for ${log.guild(guild)}`);
		else if (value instanceof TextChannel) log.info(`Set bye ${log.text(key)} to ${log.channel(value)} for ${log.guild(guild)}`);
		else log.info(`Set bye ${log.text(key)} to ${log.text(value.toString())} for ${log.guild(guild)}`);
		return bye;
	}

	private async modelToGiveaway(model: Sq.Model): Promise<Giveaway> {
		const obj: any = model.toJSON();
		const channel: TextChannel = this.client.channels.cache.get(obj.channel) as TextChannel;
		const message: Message = await channel.messages.fetch(obj.message);
		var participating: User[] = [];
		var winners: User[] = [];
		for (const id of obj.participating.split(",")) {
			if (this.client.users.cache.has(id)) {
				participating.push(this.client.users.cache.get(id));
			}
		}
		for (const id of obj.winners.split(",")) {
			if (this.client.users.cache.has(id)) {
				winners.push(this.client.users.cache.get(id));
			}
		}
		return {
			channel: channel,
			host: this.client.users.cache.get(obj.host) || null,
			end: obj.end,
			finished: obj.finished,
			message: message,
			name: obj.name,
			id: obj.id,
			participating: participating,
			winners: winners,
			winnersCount: obj.winnersCount
		}
	}

	async createGiveaway(ga: Giveaway): Promise<Giveaway> {
		const dbGA: Sq.Model = await this.models.giveaways.create({
			channel: ga.channel.id,
			name: ga.name,
			message: ga.message.id,
			winnersCount: ga.winnersCount,
			end: ga.end,
			participating: ga.participating.map(u => u.id).join(","),
			winners: ga.winners.map(u => u.id).join(","),
			finished: ga.finished,
			host: ga.host.id,
		});
		ga.id = (dbGA.toJSON() as any).id;
		log.info(`A new giveaway has been created\nID : ${log.number(ga.id)}\nName : ${log.text(ga.name)}\nChannel : ${log.channel(ga.channel)}\nHost : ${log.user(ga.host)}\nWinners : ${log.number(ga.winnersCount)}\nEnd : ${ga.end.toUTCString()}`);
		return ga;
	}

	async getGiveaway(id: number): Promise<Giveaway | null> {
		const ga: any = await this.models.giveaways.findOne({ where: { id: id } });
		if (ga === null) return null;
		return await this.modelToGiveaway(ga);
	}
	async addGAParticipating(id: number, user: User): Promise<Giveaway | null> {
		const ga: any = await this.models.giveaways.findOne({ where: { id: id } });
		if (ga === null) {
			return null;
		}
		var participating: User[] = [];
		for (const id of ga.toJSON().participating.split(",")) {
			if (this.client.users.cache.has(id)) {
				participating.push(this.client.users.cache.get(id));
			}
		}
		if (!(ga.toJSON().participating.includes(user.id) || user.bot)) participating.push(user);
		const dbEntry: string = participating.map(u => u.id).join(",");
		await this.models.giveaways.update({ participating: dbEntry }, { where: { id: id } });
		const updatedGA: Sq.Model = await this.models.giveaways.findOne({ where: { id: id } });
		log.info(`${log.user(user)} was added to the [${log.number(id)}] ${log.text(ga.toJSON().name)} giveaway.`);
		return await this.modelToGiveaway(updatedGA);
	}
	async removeGAParticipating(id: number, user: User): Promise<Giveaway | null> {
		const ga: any = await this.models.giveaways.findOne({ where: { id: id } });
		if (ga === null) {
			return null;
		}
		const ids = ga.toJSON().participating.replace(user.id, "");
		var participating: User[] = [];
		for (const id of ids.split(",")) {
			if (id === user.id) continue;
			if (this.client.users.cache.has(id)) {
				participating.push(this.client.users.cache.get(id));
			}
		}
		const dbEntry: string = participating.map(u => u.id).join(",");
		await this.models.giveaways.update({ participating: dbEntry }, { where: { id: id } });
		const updatedGA: Sq.Model = await this.models.giveaways.findOne({ where: { id: id } });
		log.info(`${log.user(user)} was removed from the [${log.number(id)}] ${log.text(ga.toJSON().name)} giveaway.`);
		return await this.modelToGiveaway(updatedGA);
	}

	async finishGiveaway(id: number, winners: User[]): Promise<Giveaway> {
		const ga: any = await this.models.giveaways.findOne({ where: { id: id } });
		if (ga === null) return null;
		const dbEntry: Object = {
			finished: true.toString(),
			winners: winners.map(u => u.id).join(",")
		};
		await this.models.giveaways.update(dbEntry, { where: { id: id } });
		if (winners.length < 1) log.info(`Nobody won the [${log.number(id)}] ${log.text(ga.toJSON().name)} giveaway.`);
		else log.info(`${winners.map(u => log.user(u)).join(", ")} won the [${log.number(id)}] ${log.text(ga.toJSON().name)} giveaway.`);
		return await this.modelToGiveaway(await this.models.giveaways.findOne({ where: { id: id } }));
	}

	async getAllGiveaways(includeFinished: boolean = false): Promise<Giveaway[]> {
		const models: Sq.Model[] = await this.models.giveaways.findAll((includeFinished) ? null : { where: { finished: false } });
		const giveaways: Giveaway[] = [];
		for (const model of models) {
			giveaways.push(await this.modelToGiveaway(model));
		}
		return giveaways;
	}

	async createStarboard(guild: Guild): Promise<StarboardSettings> {
		await this.models.starboards.create({
			guild: guild.id
		});
		log.info(`Created row in ${log.text("starboards")} table for guild ${log.guild(guild)}`);
		return {
			channel: null,
			enabled: false,
			guild: guild,
		}
	}

	async getStarboard(guild: Guild): Promise<StarboardSettings> {
		const sb: Sq.Model = await this.models.starboards.findOne({ where: { guild: guild.id } });
		if (sb === null) return await this.createStarboard(guild);
		const obj: any = sb.toJSON();
		return {
			guild: guild,
			enabled: obj.enabled,
			channel: this.client.channels.cache.get(obj.channel) as TextChannel || null
		}
	}

	async setStarboard(guild: Guild, key: "enabled" | "channel", value: any): Promise<StarboardSettings> {
		var sb: StarboardSettings = await this.getStarboard(guild);
		sb[key] = value;
		if (key === "channel") value = value.id;
		var obj: any = {};
		obj[key] = value;
		this.models.starboards.update(obj, { where: { guild: guild.id } });
		if (key === "enabled") log.info(`Set starboard ${log.text(key)} to ${log.bool(value)} for ${log.guild(guild)}`);
		else log.info(`Set starboard ${log.text(key)} to ${log.channel(value)} for ${log.guild(guild)}`);
		return sb;
	}

	private async buildDVD(guild: Guild): Promise<DVD> {
		const xs: number = (Math.random() > 0.5) ? 5 : -5;
		const ys: number = (Math.random() > 0.5) ? 5 : -5;
		// Gif Dimensions : 800x600 | Logo Dimensions : 225x130
		return {
			corners: 0,
			edges: 0,
			guild: guild,
			x: randomInt(0, 800 - 225),
			xspeed: xs,
			y: randomInt(0, 600 - 130),
			yspeed: ys
		};
	}

	async createDVD(guild: Guild): Promise<DVD> {
		const dvd: DVD = await this.buildDVD(guild);
		await this.models.dvd.create({
			corners: dvd.corners,
			edges: dvd.edges,
			guild: dvd.guild.id,
			x: dvd.x,
			xspeed: dvd.xspeed,
			y: dvd.y,
			yspeed: dvd.yspeed
		});
		log.info(`Created row in ${log.text("dvd")} table for guild ${log.guild(guild)}`);
		return dvd;
	}

	async getDVD(guild: Guild): Promise<DVD> {
		const dvd: Sq.Model = await this.models.dvd.findOne({ where: { guild: guild.id } });
		if (!dvd) return await this.createDVD(guild);
		const obj: any = dvd.toJSON();
		return {
			corners: obj.corners,
			edges: obj.edges,
			guild: this.client.guilds.cache.get(obj.guild),
			x: obj.x,
			xspeed: obj.xspeed,
			y: obj.y,
			yspeed: obj.yspeed
		}
	}

	async updateDVD(guild: Guild, dvd: DVD): Promise<DVD> {
		const obj: any = dvd;
		obj.guild = dvd.guild.id;
		await this.models.dvd.update(obj, { where: { guild: guild.id } });
		log.info(`Updated dvd for ${log.guild(guild)}`);
		return dvd;
	}

	async resetDVD(guild: Guild): Promise<DVD> {
		const dvd: DVD = await this.buildDVD(guild);
		const obj: any = dvd;
		obj.guild = dvd.guild.id;
		await this.models.dvd.update(obj, { where: { guild: guild.id } });
		log.info(`Reset dvd for ${log.guild(guild)}`);
		return dvd;
	}

	async createModerationSettings(guild: Guild): Promise<GuildModerationSettings> {
		this.models.moderationSettings.create({
			guild: guild.id,
			enableDM: true,
			modLogsEnabled: false
		});
		log.info(`Created row in ${log.text("moderationSettings")} table for guild ${log.guild(guild)}`);
		return {
			guild: guild,
			enableDM: true,
			modLogsEnabled: false
		}
	}

	async getModerationSettings(guild: Guild): Promise<GuildModerationSettings> {
		const settings: Sq.Model = await this.models.moderationSettings.findOne({ where: { guild: guild.id } });
		if (!settings) return this.createModerationSettings(guild);
		const obj: any = settings.toJSON();
		return {
			guild: guild,
			mutedRole: guild.roles.cache.get(obj.mutedRole) || null,
			enableDM: obj.enableDM,
			modLogsEnabled: obj.modLogsEnabled,
			modLogsChannel: guild.channels.cache.get(obj.modLogsChannel) as TextChannel || null

		}
	}

	async setModerationSetting(guild: Guild, key: keyof GuildModerationSettings, value: any): Promise<GuildModerationSettings> {
		const settings: GuildModerationSettings = await this.getModerationSettings(guild);
		const obj: any = {};
		settings[key] = value;
		if (key === "modLogsChannel" || key === "mutedRole") {
			obj[key] = value.id;
		} else obj[key] = value;
		this.models.moderationSettings.update(obj, { where: { guild: guild.id } });
		if (key === "modLogsChannel") log.info(`Set moderationSettings ${log.text(key)} to ${log.channel(value)} for ${log.guild(guild)}`);
		else if (key === "mutedRole") log.info(`Set moderationSettings ${log.text(key)} to ${log.role(value)} for ${log.guild(guild)}`);
		else log.info(`Set moderationSettings ${log.text(key)} to ${log.bool(value)} for ${log.guild(guild)}`);
		return settings;
	}

	async addPunishmentEntry(type: "KICK" | "MUTE" | "BAN" | "UNMUTE" | "UNBAN", guild: Guild, author: User, target: User, end?: Date, reason?: string): Promise<Punishment> {
		await this.models.punishments.create({
			type: type,
			guild: guild.id,
			author: author.id,
			target: target.id,
			reason: reason || "No reason provided",
			end: end || null
		});
		return {
			type: type,
			guild: guild,
			author: author,
			target: target,
			reason: reason,
			end: end
		};
	}

	async kick(guild: Guild, author: User, kicked: User, reason?: string): Promise<Punishment> {
		return this.addPunishmentEntry("KICK", guild, author, kicked, null, reason);
	}

	async mute(guild: Guild, author: User, muted: User, end?: Date, reason?: string): Promise<Punishment> {
		return this.addPunishmentEntry("MUTE", guild, author, muted, end, reason);
	}

	async ban(guild: Guild, author: User, banned: User, end?: Date, reason?: string): Promise<Punishment> {
		return this.addPunishmentEntry("KICK", guild, author, banned, end, reason);
	}

	async unmute(guild: Guild, author: User, unmuted: User, reason?: string): Promise<Punishment> {
		return this.addPunishmentEntry("UNMUTE", guild, author, unmuted, null, reason);
	}

	async unban(guild: Guild, author: User, unbanned: User, reason?: string): Promise<Punishment> {
		return this.addPunishmentEntry("UNMUTE", guild, author, unbanned, null, reason);
	}

}