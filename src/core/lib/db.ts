import "sequelize";
import * as Sq from "sequelize";
import { Snowflake, User } from "discord.js";
import OCBot from "../base/Client";
import * as log from "./Log";
import { BotProfile, BotProfileField } from "../typedefs/BotProfile";
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
	}

	async createProfile(user: User): Promise<BotProfile> {
		const model = this.model("profiles");
		const snowflake = user.id;
		await model.create({
			user: snowflake
		});
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
		const model = this.model("profiles");
		var profile = await model.findOne({ where: { user: user.id } });
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
		const dbProfile = await this.model("profiles").findOne({ where: { user: user.id } });
		profile[key] = value;
		if (key === "bestie") dbProfile.set("bestie", value.id);
		else dbProfile.set(key, value);
		return profile;
	}

	async incrementUser(user: User): Promise<number> {
		const uses: number = (await this.getProfile(user)).uses + 1
		this.setUser(user, "uses", uses);
		return uses;
	}

	async setCommandUses(name: string, count: number): Promise<number> {
		const model = this.model("commandUses");
		const command = await model.findOne({ where: { name: name } });
		if (command === null) {
			model.create({
				name: name,
				value: count
			});
			return count;
		}
		command.set("name", count);
		return count;
	}

	async getCommandUses(name: string): Promise<number> {
		const model = this.model("commandUses");
		const command: any = await model.findOne({ where: { name: name } });
		if (command === null) {
			return null;
		}
		return command.toJSON().count;
	}

	async incrementCommand(name: string): Promise<number> {
		const model = this.model("commandUses");
		const command = await model.findOne({ where: { name: name } });
		if (command === null) {
			this.setCommandUses(name, 1);
			return 1;
		}
		const count = await command.increment("count");
		return count.getDataValue("count");
	}
}