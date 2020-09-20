import { Message, MessageEmbed } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import AudioPlayer from "../../core/base/AudioPlayer";
import MusicQueueItem from "../../core/typedefs/MusicQueueItem";
import { formatTinyDuration } from "../../core/lib/Time";

export = class extends Command {
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
		this.check(message, async () => {
			const player: AudioPlayer = this.client.audioPlayers.get(message.guild.id);
			if (!player || !player.current) {
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
			const current: MusicQueueItem = player.current;
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Now playing", message.author.avatarURL())
				.setDescription(`**[${current.title}](${current.url})**`)
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