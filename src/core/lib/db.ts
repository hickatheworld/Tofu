import * as Sq from "sequelize";
import { User, Guild, TextChannel, Message, Snowflake, Collection, GuildChannel, GuildMemberResolvable, GuildMember } from "discord.js";
import OCBot from "../base/Client";
import * as log from "./Log";
import BotProfile from "../typedefs/BotProfile";
import GuildWelcome from "../typedefs/GuildWelcome";
import GuildBye from "../typedefs/GuildBye";
import StarboardSettings from "../typedefs/StarboardSettings";
import DVD from "../typedefs/DVD";
import { randomInt } from "./utils";
import { ProfileEmotes } from "./Constants";
import Giveaway from "../typedefs/Giveaway";
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
				unique: true,
				allowNull: false
			},
			title: {
				type: Sq.STRING,
				defaultValue: ProfileEmotes.TITLE_DEFAULT + " Bot user"
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
				defaultValue: { message: "Welcome to {SERVER_NAME}, {USER_MENTION} !" },
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
		this.define("giveaways", {
			end: {
				type: Sq.DATE,
				allowNull: false
			},
			channel: {
				type: Sq.STRING,
				allowNull: false
			},
			finished: {
				type: Sq.BOOLEAN,
				allowNull: false
			},
			guild: {
				type: Sq.STRING,
				allowNull: false
			},
			host: {
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
			winCount: {
				type: Sq.INTEGER,
				allowNull: false
			},
			winners: {
				type: Sq.STRING
			}
		}).sync({ force: force });
		log.info("Defined Sequelize models");
	}

	async createProfile(user: User): Promise<BotProfile> {
		const model = this.model("profiles");
		const snowflake = user.id;
		try {
			await model.create({
				user: snowflake
			});
		} catch (err) {
			/* This is a quick fix
			Must find why this is triggered twice for the same user */
		}
		log.info(`Generated profile for ${log.user(user)}`);
		return {
			bestie: null,
			canRep: true,
			cookies: 0,
			desc: null,
			rep: 0,
			title: ProfileEmotes.TITLE_DEFAULT + " Bot user",
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

	async createGiveaway(ga: Giveaway): Promise<Giveaway> {
		const model: Sq.Model = await this.models.giveaways.create({
			end: ga.end,
			channel: ga.channel.id,
			finished: false,
			guild: ga.guild.id,
			host: ga.host.id,
			message: ga.message.id,
			name: ga.name,
			winCount: ga.winCount
		});
		log.info(`New giveaway created in guild ${log.guild(ga.guild)}`);
		return {
			end: ga.end,
			channel: ga.channel,
			finished: false,
			guild: ga.guild,
			host: ga.host,
			id: (model.toJSON() as any).id,
			message: ga.message,
			name: ga.name,
			winCount: ga.winCount
		}
	}
	async fetchGiveaways(): Promise<Collection<number, Giveaway>> {
		const gas: Collection<number, Giveaway> = new Collection();
		const all: any[] = (await this.models.giveaways.findAll()).map(m => m.toJSON());
		for (var model of all) {
			var guild: Guild = null;
			var host: User = null;
			var channel: GuildChannel = null;
			var message: Message = null;
			var winners: (GuildMember | GuildMemberResolvable)[] = [];
			try {
				guild = await this.client.guilds.fetch(model.guild);
			} catch (err) { /* pass */ }
			host = await this.client.users.fetch(model.host);
			if (!guild) {
				await this.models.giveaways.destroy({ where: { id: model.id } });
				log.warn(`Giveaway ${log.number(model.id)} was deleted due to Guild loss.`);
				continue;
			}
			channel = guild.channels.resolve(model.channel);
			if (!channel && !model.finished) {
				await this.models.giveaways.destroy({ where: { id: model.id } });
				host.send(`The giveaway \`${model.name}\` (id: ${model.id}) was deleted due to Channel loss.\nIt may have been deleted or I lost permissions.`);
				log.warn(`Giveaway ${log.number(model.id)} was deleted due to Channel loss.`);
				continue;
			}
			try {
				message = await (channel as TextChannel).messages.fetch(model.message);
			} catch (err) { /* pass */ }
			if (!message && !model.finished) {
				await this.models.giveaways.destroy({ where: { id: model.id } });
				host.send(`The giveaway \`${model.name}\` (id: ${model.id}) was deleted due to Message loss. (the message the members have to react to)\nIt probably was deleted`);
				log.warn(`Giveaway ${log.number(model.id)} was deleted due to Message loss.`);
				continue;
			}
			if (model.finished && model.winners) {
				for (const u of model.winners.split(",")) {
					const member: GuildMember = await guild.members.fetch(u);
					winners.push(member || u);
				}
			}
			gas.set(model.id, {
				channel: channel,
				end: model.end,
				finished: model.finished,
				guild: guild,
				host: host,
				id: model.id,
				message: message,
				name: model.name,
				winCount: model.winCount,
				winners: winners
			});
		}
		return gas;
	}
}