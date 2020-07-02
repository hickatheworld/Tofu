import OCBot from "./Client";
import { Message, Snowflake, Collection, User } from "discord.js";
import {formatDuration} from "../lib/Time";
import CommandOptions from "../typedefs/CommandOptions";
import Argument from "../typedefs/Argument";

export default abstract class Command {
	private client: OCBot;
	public aliases: string[];
	public arguments?: Argument[];
	public cooldown: number;
	public desc: string;
	public module: string;
	public name: string;
	public whitelist?: User[];
	private cooldowned?: Collection<Snowflake, number>;
	
	constructor(client: OCBot, options: CommandOptions) {
		this.client = client;
		this.aliases = options.aliases ?? [];
		this.arguments = options.arguments;		
		this.cooldown = options.cooldown ?? 0;
		this.desc = options.desc;		
		this.module = options.module;		
		this.name = options.name;		
		this.whitelist = options.whitelist;		
		if (this.cooldown > 0) this.cooldowned = new Collection<Snowflake, number>();
	}
		
	public async exe(message: Message, callback: Function) {
		if (!this.whitelist!.includes(message.author)) {
			const msg = await message.channel.send("You're not authorized to use this command.")
			setTimeout(msg.delete, 2000);
			return;
		}
		if (this.cooldowned!.has(message.author.id)) {
			const duration = formatDuration(new Date(this.cooldown), new Date(), true); 
			const msg = await message.channel.send(`You're on cooldown for this command. Please wait another ${duration}.`);
			setTimeout(msg.delete, 2000);
			return;
		}
		this.client.db.incrementCommand(this.name);
		this.client.db.incrementUser(message.author);
		callback();
	}

}