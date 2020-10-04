import { Message, MessageEmbed } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import AudioPlayer from "../../core/base/AudioPlayer";
import ytdl = require("ytdl-core");
import ytpl = require("ytpl");
import ytsr = require("ytsr");
import { AllHtmlEntities } from "html-entities";
import { formatDuration, formatTinyDuration } from "../../core/lib/Time";
import MusicQueueItem from "../../core/typedefs/MusicQueueItem";
import { writeFileSync } from "fs";
export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "play",
			desc: "Plays a youtube video in voice channel from url or name",
			module: "Music",
			usages: [
				"[video: String]"
			],
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		this.check(message, async () => {
			const query: string = args.join(" ").trim();
			var player: AudioPlayer;
			if (this.client.audioPlayers.has(message.guild.id)) player = this.client.audioPlayers.get(message.guild.id);
			if (!query) {
				if (!player || !player.playing) {
					this.error("Nothing is playing in this server", message.channel);
					return;
				}
				if (player.paused) {
					if (!message.guild.me.voice.channel) {
						if (!player.channel.joinable || !player.channel.speakable) {
							this.error("I can't join this voice channel.", message.channel);
							this.client.audioPlayers.delete(message.guild.id);
							return;
						}
						return;
					}
					player.resume();
					message.channel.send("▶ **Resumed**");
					return;
				}
				else {
					this.error("The player isn't paused.", message.channel);
					return;
				}
			}
			if (!message.member.voice.channel) {
				this.error("You must be connected to a voice channel to use this command.", message.channel);
				return;
			}
			if (!message.member.voice.channel.joinable) {
				this.error("I can't join this voice channel.", message.channel);
				return;
			}
			if (!message.member.voice.channel.speakable) {
				this.error("I can't play audio to this voice channel.", message.channel);
				return;
			}
			if (player && player.channel !== message.member.voice.channel) {
				this.error("You must be in the same voice channel as I am to use this command.", message.channel);
				return;
			}
			if (!player) {
				this.warn("Music module is still under development. Bugs are likely to happen.", message.channel);
				player = new AudioPlayer(this.client, message.member.voice.channel);
				this.client.audioPlayers.set(message.guild.id, player);
			}
			try {
				await player.join();
			} catch (err) {
				this.error("An error occured", message.channel, err);
				return;
			}
			var entry: MusicQueueItem = {} as MusicQueueItem;
			try {
				const link: string = "https://youtube.com/watch?v=" + ytdl.getVideoID(query);
				const infos: ytdl.MoreVideoDetails = (await ytdl.getBasicInfo(link)).videoDetails;
				entry = {
					channelLink: infos.author.channel_url,
					channelName: infos.author.name,
					live: infos.isLiveContent,
					duration: (entry.live) ? -1 : parseInt(infos.lengthSeconds) * 1000,
					displayDuration: (entry.live) ? "LIVE" : formatTinyDuration(parseInt(infos.lengthSeconds) * 1000),
					imgUrl: infos.thumbnail.thumbnails[infos.thumbnail.thumbnails.length - 1].url,
					requestedBy: message.member,
					title: infos.title,
					url: infos.video_url
				};
			} catch (_) {
				const results: ytsr.Result = await ytsr(query, { limit: 10 });
				if (results.items.length > 0) {
					const items: ytsr.Item[] = results.items.filter((i: any) => i.type === "video");
					const infos: ytsr.Video = items[0] as ytsr.Video;
					const parsedDuration: string[] = infos.duration.split(":").reverse();
					const secs = parseInt(parsedDuration.shift());
					var mins = 0;
					var hours = 0;
					if (parsedDuration.length > 0) mins = parseInt(parsedDuration.shift());
					if (parsedDuration.length > 0) hours = parseInt(parsedDuration.shift());
					const duration: number = secs * 1000 + mins * 1000 * 60 + hours * 1000 * 60 * 60;
					entry = {
						channelLink: infos.author.ref,
						channelName: infos.author.name,
						live: infos.live,
						duration: duration,
						displayDuration: (entry.live) ? "LIVE" : formatTinyDuration(duration),
						imgUrl: infos.thumbnail,
						requestedBy: message.member,
						title: infos.title,
						url: infos.link
					};
				} else {
					this.error(`No result for \`${query}\``, message.channel);
					return;
				}
			}
			console.log(entry);
			if (entry.duration > 1.44e7) {
				this.error("Can't play a song that is longer than 4 hours.", message.channel);
				return;
			}
			if (player.playing) player.queueAdd(entry);
			else {
				player.play(entry);
				message.channel.send(`▶ Now playing: **${entry.title}**`);
				return;
			}
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Queued", message.author.avatarURL())
				.setDescription(`**[${entry.title}](${entry.url})**`)
				.setImage(entry.imgUrl)
				.addField("Channel", `[${entry.channelName}](${entry.channelLink})`, true)
				.addField("Position in queue", player.queue.length, true)
				.addField("Duration", entry.displayDuration, true);
			message.channel.send(embed);
		});
	}

}