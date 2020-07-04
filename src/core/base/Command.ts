import OCBot from "./Client";
import { Message, Snowflake, Collection, User } from "discord.js";
import { formatDuration } from "../lib/Time";
import CommandOptions from "../typedefs/CommandOptions";

export default abstract class Command {
	protected client: OCBot;
	public aliases: string[];
	public usages?: string[];
	public cooldown: number;
	public desc: string;
	public module: string;
	public name: string;
	public whitelist?: User[];
	protected cooldowned?: Collection<Snowflake, number>;
	public funcs: Map<string, Function>;

	constructor(client: OCBot, options: CommandOptions) {
		this.client = client;
		this.aliases = options.aliases ?? [];
		this.usages = options.usages;
		this.cooldown = options.cooldown ?? 0;
		this.desc = options.desc;
		this.module = options.module;
		this.name = options.name;
		this.whitelist = options.whitelist;
		this.cooldowned = new Collection<Snowflake, number>();
		this.funcs = new Map<string,Function>();
	}
	public abstract exe(message: Message, args: string[]): Promise<void>;
	public async check(message: Message, callback: Function): Promise<void> {
		if (this.whitelist) {
			if (!this.whitelist.includes(message.author)) {
				const msg = await message.channel.send("You're not authorized to use this command.")
				setTimeout(() => {
					msg.delete();
					if (message.deletable) message.delete();
				}, 1500);
				return;
			}
		}
		if (this.cooldowned.has(message.author.id)) {
			const duration = formatDuration(new Date(this.cooldowned.get(message.author.id)), new Date(), true);
			const msg = await message.channel.send(`You're on cooldown for this command. Please wait another ${duration}.`);
			setTimeout(() => {
				msg.delete();
				if (message.deletable) message.delete();
			}, 1500);
			return;
		}
		this.client.db.incrementCommand(this.name);
		this.client.db.incrementUser(message.author);
		this.cooldowned.set(message.author.id, Date.now() + this.cooldown);
		setTimeout(() => this.cooldowned.delete(message.author.id), this.cooldown);
		callback();
	}

}