import { Message, MessageEmbed } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import AudioPlayer from "../../core/base/AudioPlayer";
import MusicQueueItem from "../../core/typedefs/MusicQueueItem";
import { formatTinyDuration } from "../../core/lib/Time";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "queue",
			desc: "Lists songs in queue",
			module: "Music",
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async () => {
			const player: AudioPlayer = this.client.audioPlayers.get(message.guild.id);
			if (!player || player.queue.length === 0) {
				this.error("Nothing is playing in this server.", message.channel);
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
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Queue", message.author.avatarURL())
				.setDescription(`**Now playing:** : [${player.current.title}](${player.current.url})`);
			var totalDuration: number = 0;
			for (var i = 0; i < 10; i++) {
				if (i == player.queue.length) break;
				if (i === 0) {
					embed.description += "\n\n**Up next**\n"
				}
				const e = player.queue[i];
				embed.description += `\n\`${i + 1}.\` [**${e.title}**](${e.url}) | \`${e.displayDuration}\` Requested by ${e.requestedBy}`
				totalDuration += (e.duration == 0) ? Infinity : e.duration;
			}
			if (totalDuration !== Infinity) {
				totalDuration += player.current.duration - player.streamTime
			}
			embed.setFooter(`${player.queue.length} song${(player.queue.length > 1) ? "s" : ""} in queue ${(totalDuration !== Infinity && totalDuration > 0) ? `• ${formatTinyDuration(totalDuration)} remaining` : ""}`);
			message.channel.send(embed);
		});
	}
}