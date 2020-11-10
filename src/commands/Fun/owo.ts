import { Message } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";

const EYES: string[] = ["OO", "oo", "ÒÓ", "òó", "QQ", "qq", "ÈÉ", "èé", "ÙÚ", "ùú", "--", "••", "¬¬", ";;", "^^", "++"];
const MOUTHS: string[] = ["w", "W", "u", "_", "__", ".", "-", "^", "~", "c", "x"];

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "owo",
			desc: "Generates a random owo like smiley",
			module: "Fun"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, () => {
			const mouth: string = MOUTHS[Math.floor(Math.random() * MOUTHS.length)];
			const eyes: string = EYES[Math.floor(Math.random() * EYES.length)];
			if (Math.random() >= 0.5) message.channel.send(`${eyes[0]}${mouth}${eyes[1]}`);
			else message.channel.send(`${eyes[1]}${mouth}${eyes[0]}`);
		});
	}
}
