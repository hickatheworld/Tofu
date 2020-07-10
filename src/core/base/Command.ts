import OCBot from "./Client";
import { Message, Snowflake, Collection, User } from "discord.js";
import { formatDuration } from "../lib/Time";
import CommandOptions from "../typedefs/CommandOptions";

export default abstract class Command {
	public aliases: string[];
	protected client: OCBot;
	public cooldown: number;
	protected cooldowned?: Collection<Snowflake, number>;
	public desc: string;
	public module: string;
	public name: string;
	public props: Map<string, any>;
	public usages?: string[];
	public whitelist?: Snowflake[];
	constructor(client: OCBot, options: CommandOptions) {
		this.aliases = options.aliases ?? [];
		this.client = client;
		this.cooldown = options.cooldown ?? 0;
		this.cooldowned = new Collection<Snowflake, number>();
		this.desc = options.desc;
		this.module = options.module;
		this.name = options.name;
		this.props = new Map<string, any>();
		this.usages = options.usages;
		this.whitelist = options.whitelist;
	}

	public abstract async setup(): Promise<void>;
	public abstract async exe(message: Message, args: string[]): Promise<void>;
	
	public async check(message: Message, callback: Function): Promise<void> {
		if (this.whitelist) {
			if (!this.whitelist.includes(message.author.id)) {
				const msg: Message = await message.channel.send("You're not authorized to use this command.")
				setTimeout(() => {
					msg.delete();
					if (message.deletable) message.delete();
				}, 1500);
				return;
			}
		}
		if (this.cooldowned.has(message.author.id)) {
			const duration: string = formatDuration(new Date(this.cooldowned.get(message.author.id)), new Date(), true);
			const msg: Message = await message.channel.send(`You're on cooldown for this command. Please wait another ${duration}.`);
			setTimeout(() => {
				msg.delete();
				if (message.deletable) message.delete();
			}, 1500);
			return;
		}
		this.client.db.incrementCommand(this.name);
		this.client.db.incrementUser(message.author);
		if (!this.client.admins.includes(message.author.id)) {
			this.cooldowned.set(message.author.id, Date.now() + this.cooldown);
			setTimeout(() => this.cooldowned.delete(message.author.id), this.cooldown);
		}
		callback();
	}

}