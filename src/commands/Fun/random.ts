import { Message } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseNumber } from "../../core/lib/Args";

const rnd: Function = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "random",
			desc: "Gives you a random number",
			module: "Fun",
			usages: [
				"",
				"<max: Number>",
				"<min: Number> <max: Number>"
			]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]) {
		super.check(message, () => {
			var min: number = parseNumber(args[0]);
			var max: number = parseNumber(args[1]);
			if (min === null) {
				min = -1000000000;
				max = 1000000000;
			} else if (max === null) {
				max = min
				min = 0;
			}
			if (min > max) {
				const temp: number = max;
				max = min;
				min = temp;
			}
			message.channel.send(`**${rnd(min, max)}**`);
		});
	}
}