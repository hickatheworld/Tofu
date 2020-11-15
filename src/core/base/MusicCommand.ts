import { Message } from "discord.js";
import CommandOptions from "../typedefs/CommandOptions";
import AudioPlayer from "./AudioPlayer";
import OCBot from "./Client";
import Command from "./Command";

export default abstract class MusicCommand extends Command {
	private needsPlayer: boolean;
	constructor(client: OCBot, options: CommandOptions, needsPlayer = true) {
		super(client, options);
		this.needsPlayer = needsPlayer;
	}

	public abstract async setup(): Promise<void>;
	public abstract async exe(message: Message, args: string[]): Promise<void>;

	public async check(message: Message, callback: Function) {
		super.check(message, () => {
			this.error("Music module is disabled due to tier service breakage.", message.channel);
			return;
			var player: AudioPlayer;
			if (this.client.audioPlayers.has(message.guild.id)) player = this.client.audioPlayers.get(message.guild.id);
			if (!message.member.voice.channel) {
				this.error("You must be connected to a voice channel to use this command.", message.channel);
				return;
			}
			if (player && player.channel !== message.member.voice.channel) {
				this.error(`Please join **${player.channel.name}** to use this command.`, message.channel);
				return;
			}
			if (this.needsPlayer) {
				if (!player) {
					this.error("I'm not connected to a voice channel.", message.channel);
					return;
				}
				if (!player.current) {
					this.error("Nothing is playing in this server.", message.channel);
					return;
				}
			}
			callback(player);
		});
	}


}
