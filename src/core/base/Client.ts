import { Client, Snowflake, User, Collection } from "discord.js";
import BotOptions from "../typedefs/BotOptions";
import { promises as fs, existsSync as exists } from "fs";
import { join } from "path";
import * as log from "../lib/Log";
import Command from "./Command";
import DB from "../lib/db";

export default class OCBot extends Client {
	public admins: Collection<Snowflake, User>;
	private adminIDs: Snowflake[];
	public description: string;
	public name: string;
	public owner: User;
	private ownerID: Snowflake
	public prefix: string;
	public readonly test: boolean;
	private commands: Collection<string, Command>;
	private aliases: Collection<string, string>;
	public db: DB;

	constructor(options: BotOptions) {
		super();
		this.adminIDs = options.admins;
		this.description = options.description;
		this.name = options.name;
		this.ownerID = options.owner;
		this.prefix = options.prefix;
		this.token = options.token;
		this.test = options.test;
		this.db = new DB(this);
		this.commands = new Collection<string, Command>();
		this.aliases = new Collection<string, string>();
	}

	public async loadModules() {
		const dirs = (await fs.readdir(join(__dirname, "../../commands"), { withFileTypes: true }))
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		var loaded = 0;
		var failed = 0;
		for (const dir of dirs) {
			try {
				log.info(`Loading module ${log.text(dir)}`);
				const files = (await fs.readdir(join(__dirname, "../../commands/", dir))).filter(file => file.endsWith(".js"));
				for (const file of files) {
					try {
						const f = require(join(__dirname, "../../commands/", dir, file));
						const cmd = new f(this);
						this.commands.set(cmd.name, cmd);
						for (const alias of cmd.aliases) {
							this.aliases.set(alias, cmd.name);
						}
					} catch (e) {
						log.error(`An error occured while loading command ${log.text(file.split(".")[0])} from module ${log.text(dir)}`);
						log.error(e);
						failed++;
						continue;
					}
					log.info(`Loaded command ${log.text(file.split(".")[0])} from module ${log.text(dir)}`);
					loaded++;
				}
			} catch (e) {
				log.error(`An error occured while loading module ${log.text(dir)}`);
				continue;
			}
		}
		log.info(`Loaded ${log.number(loaded)} commands from ${log.number(dirs.length)} modules.`);
		if (failed > 0) log.warn(`${log.number(failed)} commands failed to load.`);
	}

	public async loadEvents() {
		const files = (await fs.readdir(join(__dirname, "../../events"))).filter(file => file.endsWith(".js"));
		var loaded = 0;
		var failed = 0;
		for (const file of files) {
			try {
				const f = require(join(__dirname, "../../events/", file));
				const event = new f(this);
				this[(event.once) ? "once" : "on"](event.name, (...args) => event.exe(...args));
			} catch (e) {
				log.error(`An error occured while loading event ${log.text(file.split(".")[0])}`);
				log.error(e);
				failed++;
				continue;
			}
			loaded++;
		}
		log.info(`Loaded ${log.number(loaded)} events`);
		if (failed > 0) log.warn(`${log.number(failed)} events failed to load.`);
	}

	public async run() {
		await this.loadEvents();
		await this.loadModules();
		console.log(this.token);
		this.login(this.token);
	}
}