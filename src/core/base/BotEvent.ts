import OCBot from "./Client";

export abstract class BotEvent {
	protected client: OCBot;
	public name: string;
	public once: boolean;
	constructor(client: OCBot, name: string, once: boolean) {
		this.client = client;
		this.name = name;
		this.once = once;
	}

	public abstract exe(...args: any): void;
}