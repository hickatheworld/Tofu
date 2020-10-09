import { Message } from "discord.js";
import OCBot from "../../core/base/Client";
import AudioPlayer from "../../core/base/AudioPlayer";
import MusicCommand from "../../core/base/MusicCommand";

export = class extends MusicCommand {
	constructor(client: OCBot) {
		super(client, {
			name: "skip",
			desc: "Skips currently playing song",
			module: "Music"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async (player: AudioPlayer) => {
			if (!player || !player.playing) {
				this.error("Nothing is playing in this server", message.channel);
				return;
			}
			player.skip();
			message.channel.send("⏩ **Skipped**");
		});
	}
}