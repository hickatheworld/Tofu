import OCBot from "../core/base/Client";
import * as log from "../core/lib/Log";

export = class {
	private client: OCBot;
	public name: string;
	public once: boolean;
	constructor(client: OCBot) {
		this.client = client;
		this.name = "ready";
		this.once = false;
	}

	exe() {
		log.info("Bot ready.");
	}
}