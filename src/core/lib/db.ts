import "sequelize";
import * as Sq from "sequelize";
import { User, Guild, TextChannel } from "discord.js";
import OCBot from "../base/Client";
import * as log from "./Log";
import { BotProfile, BotProfileField } from "../typedefs/BotProfile";
import { GuildWelcome, GuildWelcomeField } from "../typedefs/GuildWelcome";
import { GuildByeField, GuildBye } from "../typedefs/GuildBye";
import { Model } from "sequelize";
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
			uses: 0,
			user: user
		};
	}

	async getProfile(user: User): Promise<BotProfile> {
		var profile: Model = await this.models.profiles.findOne({ where: { user: user.id } });
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
			uses: obj.uses,
			user: user
		};
	}

	async setUser(user: User, key: BotProfileField, value: any): Promise<BotProfile> {
		const profile: any = await this.getProfile(user);
		profile[key] = value;
		const obj: any = {};
		if (key === "bestie") obj[key] = value.id;
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
		const command: Model = await this.models.commandUses.findOne({ where: { name: name } });
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
		const welcome: Model = await this.models.welcomes.findOne({ where: { guild: guild.id } });
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

	async setWelcome(guild: Guild, key: GuildWelcomeField, value: any): Promise<GuildWelcome> {
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
		const bye: Model = await this.models.byes.findOne({ where: { guild: guild.id } });
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

	async setBye(guild: Guild, key: GuildByeField, value: any): Promise<GuildBye> {
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

}