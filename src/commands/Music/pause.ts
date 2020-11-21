import { Message } from "discord.js";
import Tofu from "../../core/base/Client";
import AudioPlayer from "../../core/base/AudioPlayer";
import MusicCommand from "../../core/base/MusicCommand";

export = class extends MusicCommand {
	constructor(client: Tofu) {
		super(client, {
			name: "pause",
			desc: "Pauses currently playing audio",
			module: "Music"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async (player: AudioPlayer) => {
			if (player.paused) {
				this.error("The player is already paused", message.channel);
				return;
			}
			if (!player || !player.playing) {
				this.error("Nothing is playing in this server", message.channel);
				return;
			}
			player.pause();
			player.startLeaveTimeout(6e5);
			message.channel.send("⏸ **Paused**");
		});
	}
}