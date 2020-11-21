import { Message, MessageEmbed } from "discord.js";
import Tofu from "../../core/base/Client";
import AudioPlayer from "../../core/base/AudioPlayer";
import { formatTinyDuration } from "../../core/lib/Time";
import MusicCommand from "../../core/base/MusicCommand";

export = class extends MusicCommand {
	constructor(client: Tofu) {
		super(client, {
			name: "queue",
			desc: "Lists songs in queue",
			module: "Music",
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async (player: AudioPlayer) => {
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Queue", message.author.avatarURL())
				.setColor("#2f3136")
				.setDescription(`**Now playing:** [${player.current.title}](${player.current.url})`);
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