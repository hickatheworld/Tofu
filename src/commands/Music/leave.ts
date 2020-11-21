import { Message } from "discord.js";
import Tofu from "../../core/base/Client";
import MusicCommand from "../../core/base/MusicCommand";
import AudioPlayer from "../../core/base/AudioPlayer";

export = class extends MusicCommand {
	constructor(client: Tofu) {
		super(client, {
			name: "leave",
			desc: "Leaves voice channel and clears queue",
			module: "Music"
		}, false);
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async (player: AudioPlayer) => {
			if (!player) {
				this.error("I'm not connected to a voice channel", message.channel);
				return;
			}
			player.channel.leave();
			this.client.audioPlayers.delete(message.guild.id);
			message.channel.send("👋 **Left voice channel**");
		});
	}
}