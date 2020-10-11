import OCBot from "./Client";

export default abstract class BotEvent {
	protected client: OCBot;
	public name: string;
	public once: boolean;
	public props: Map<string, any>;
	constructor(client: OCBot, name: string, once = false) {
		this.client = client;
		this.name = name;
		this.once = once;
		this.props = new Map<string, any>();
	}

	public abstract exe(...args: any): void;
}