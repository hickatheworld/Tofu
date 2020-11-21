import Tofu from "./Client";

export default abstract class BotEvent {
	protected client: Tofu;
	public name: string;
	public once: boolean;
	public props: Map<string, any>;
	constructor(client: Tofu, name: string, once = false) {
		this.client = client;
		this.name = name;
		this.once = once;
		this.props = new Map<string, any>();
	}

	public abstract exe(...args: any): void;
}