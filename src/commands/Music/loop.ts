import { Message } from "discord.js";
import Tofu from "../../core/base/Client";
import MusicCommand from "../../core/base/MusicCommand";
import AudioPlayer from "../../core/base/AudioPlayer";

export = class extends MusicCommand {
	constructor(client: Tofu) {
		super(client, {
			name: "loop",
			desc: "Loops currently playing audio",
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
			player.loop = !player.loop;
			message.channel.send(`🔂 **${(player.loop) ? "Enabled" : "Disabled"} loop**`);
		});
	}
}