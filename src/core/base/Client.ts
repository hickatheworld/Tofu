import { Client, Snowflake, Collection, ClientEvents } from "discord.js";
import { promises as fs } from "fs";
import { join } from "path";
import BotOptions from "../typedefs/BotOptions";
import Command from "./Command";
import * as log from "../lib/Log";
import DB from "../lib/db";
import BotEvent from "./BotEvent";

export default class OCBot extends Client {
	public admins: Snowflake[];
	public description: string;
	public name: string;
	public owner: Snowflake
	public prefix: string;
	public readonly test: boolean;
	public commands: Collection<string, Command>;
	public aliases: Collection<string, string>;
	public modules: Collection<string, string[]>;
	public db: DB;

	constructor(options: BotOptions) {
		super();
		this.admins = options.admins;
		this.description = options.description;
		this.name = options.name;
		this.owner = options.owner;
		this.prefix = options.prefix;
		this.token = options.token;
		this.test = options.test;
		this.db = new DB(this);
		this.commands = new Collection<string, Command>();
		this.aliases = new Collection<string, string>();
		this.modules = new Collection<string, string[]>();
	}

	public async loadModules() {
		const dirs: string[] = (await fs.readdir(join(__dirname, "../../commands"), { withFileTypes: true }))
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		var loaded: number = 0;
		var failed: number = 0;
		for (const dir of dirs) {
			try {
				log.info(`Loading module ${log.text(dir)}`);
				this.modules.set(dir, []);
				const files: string[] = (await fs.readdir(join(__dirname, "../../commands/", dir))).filter(file => file.endsWith(".js"));
				for (const file of files) {
					try {
						const f = require(join(__dirname, "../../commands/", dir, file));
						const cmd: Command = new f(this);
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
					this.modules.get(dir).push(file.split(".")[0]);
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
		const files: string[] = (await fs.readdir(join(__dirname, "../../events"))).filter(file => file.endsWith(".js"));
		var loaded: number = 0;
		var failed: number = 0;
		for (const file of files) {
			try {
				const f = require(join(__dirname, "../../events/", file));
				const event: BotEvent = new f(this);
				this[(event.once) ? "once" : "on"](event.name as keyof ClientEvents, (...args) => event.exe(...args));
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
		this.login(this.token);
	}
}