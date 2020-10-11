import { Message, MessageEmbed } from "discord.js";
import OCBot from "../../core/base/Client";
import MusicCommand from "../../core/base/MusicCommand";
import AudioPlayer from "../../core/base/AudioPlayer";
import MusicQueueItem from "../../core/typedefs/MusicQueueItem";
import { formatTinyDuration } from "../../core/lib/Time";

export = class extends MusicCommand {
	constructor(client: OCBot) {
		super(client, {
			name: "now-playing",
			desc: "Gives information about the currently playing audio",
			module: "Music",
			aliases: ["np"]
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async (player: AudioPlayer) => {
			const current: MusicQueueItem = player.current;
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Now playing", message.author.avatarURL())
				.setDescription(`**[${current.title}](${current.url})**`)
				.setColor("#2f3136")
				.addField("Channel", `[${current.channelName}](${current.channelLink})`, true)
				.addField("Requested by", current.requestedBy, true)
				.setThumbnail(current.imgUrl);
			var progress: string;
			if (current.duration == -1) {
				progress = `\`${formatTinyDuration(player.streamTime)}\` / \`??:??:??\``
			} else if (current.live) {
				progress = `| ${"█".repeat(20)} |\n\`${formatTinyDuration(player.streamTime)}\` / \`LIVE\``
			} else {
				const count: number = Math.floor(player.streamTime / current.duration * 20);
				progress = `| ${"█".repeat(count)}${"░".repeat(20 - count)} |\n\`${formatTinyDuration(player.streamTime)}\` / \`${current.displayDuration}\` `
			}
			embed.addField("Progress", progress);
			message.channel.send(embed);

		});
	}

}