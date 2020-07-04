import "sequelize";
import * as Sq from "sequelize";
import { Snowflake, User, Guild } from "discord.js";
import OCBot from "../base/Client";
import * as log from "./Log";
import { BotProfile, BotProfileField } from "../typedefs/BotProfile";
import { Model } from "sequelize";
require("dotenv").config();
export default class DB extends Sq.Sequelize {
	private client: OCBot;
	constructor(client: OCBot) {
		super("OCBot", null, null, {
			dialect: "sqlite",
			logging: console.log,
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
		var profile = await this.models.profiles.findOne({ where: { user: user.id } });
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
		const command: any = await this.models.commandUses.findOne({ where: { name: name } });
		if (command === null) {
			this.models.commandUses.create({
				name: name,
				value: 0
			});
			return 0;
		}
		return command.toJSON().count;
	}

	async incrementCommand(name: string): Promise<number> {
		const old = await this.getCommandUses(name);
		const count = await this.setCommandUses(name, old + 1);
		return count;
	}
}