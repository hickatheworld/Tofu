import { MessageEmbed } from "discord.js";
import { BotResponseColors, BotResponseEmotes } from "../lib/Constants";

export default class BotResponse {
	private _message: string;
	private _type: "SUCCESS" | "WARNING" | "ERROR";
	private _error?: Error;
	private embed: MessageEmbed;
	constructor(message: string, type: "ERROR" | "SUCCESS" | "WARNING", error?: Error) {
		this._message = message;
		this._type = type;
		this._error = error;
		this.embed = new MessageEmbed()
			.setColor(BotResponseColors[type])
			.setDescription(BotResponseEmotes[type] + " " + message);
		if (error) {
			this.embed.description += "\n**Error message:** ```" + error.message + "```";
		}
	}

	get message(): string {
		return this._message;
	}
	set message(message: string) {
		this._message = message;
		this.embed.description = BotResponseEmotes[this._type] + " " + message;
		if (this._error) {
			this.embed.description += "\n**Error message:** ```" + this._error.message + "```";
		}
	}

	get type(): "SUCCESS" | "WARNING" | "ERROR" {
		return this._type;
	}
	set type(type: "SUCCESS" | "WARNING" | "ERROR") {
		this._type = type;
		this.embed.setColor(BotResponseColors[type])
		this.embed.description = this.embed.description.split(" ").slice(1).join(" ");
		this.embed.description = BotResponseEmotes[type] + " " + this.embed.description;
	}

	get error(): Error {
		return this._error;
	}
	set error(err: Error) {
		this._error = err;
		this.embed.description = this.embed.description.split("\n**Error message:**")[0];
		this.embed.description += "\n**Error message:** ```" + err.message + "```";
	}

	public toEmbed(): MessageEmbed {
		return this.embed;
	}


}