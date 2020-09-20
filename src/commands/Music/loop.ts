import { Message } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import AudioPlayer from "../../core/base/AudioPlayer";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "loop",
			desc: "Loops currently playing audio",
			module: "Music"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async () => {
			var player: AudioPlayer;
			if (this.client.audioPlayers.has(message.guild.id)) player = this.client.audioPlayers.get(message.guild.id);
			if (!player || !player.playing) {
				this.error("Nothing is playing in this server", message.channel);
				return;
			}
			if (!message.member.voice.channel) {
				this.error("You must be connected to a voice channel to use this command.", message.channel);
				return;
			}
			if (player && player.channel !== message.member.voice.channel) {
				this.error("You must be in the same voice channel as I am to use this command.", message.channel);
				return;
			}
			player.loop = !player.loop;
			message.channel.send(`🔂 **${(player.loop) ? "Enabled" : "Disabled"} loop**`);
		});
	}
}