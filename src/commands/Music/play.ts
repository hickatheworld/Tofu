import { Message, MessageEmbed } from "discord.js";
import OCBot from "../../core/base/Client";
import Command from "../../core/base/Command";
import nodeFetch from "node-fetch";
import AudioPlayer from "../../core/base/AudioPlayer";
import { AllHtmlEntities } from "html-entities";
import { formatDuration, formatTinyDuration } from "../../core/lib/Time";
import MusicQueueItem from "../../core/typedefs/MusicQueueItem";
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
			var entry: MusicQueueItem = {
				channelLink: "https://youtube.com/",
				channelName: "Unkown Channel",
				displayDuration: "00:00",
				duration: -1,
				imgUrl: "https://i.ytimg.com/vi/q14dwkPQjfI/maxresdefault.jpg",
				live: false,
				requestedBy: message.member,
				title: "Can't get title",
				url: null
			};

			const ytID: RegExp = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/
			var vidID: string = "";
			if (ytID.test(query)) {
				vidID = ytID.exec(query)[ytID.exec(query).length - 1];
				entry.url = "https://youtube.com/watch?v=" + vidID;
			} else {
				const search: any = await nodeFetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
				const searchResults: any = await search.json();
				if (searchResults.error) {
					player.partial = true;
					if (ytID.test(query)) {
						vidID = ytID.exec(query)[ytID.exec(query).length - 1];
						entry.url = "https://youtube.com/watch?v=" + vidID;
					} else {
						if (searchResults.error.errors[0].reason === "quotaExceeded") {
							this.error("YouTube API quota exceeded. To continue playing music, please provide direct YouTube video URLs.", message.channel);
							return
						}
						this.error("Unknown YouTube API error. You can keep playing music providing direct YouTube video URLs", message.channel);
						return;
					}
				} else {
					player.partial = false;
					if (!searchResults.items || searchResults.items.length == 0) {
						this.error(`No result found for **${query}** on YouTube`, message.channel);
						return;
					}
					const item: any = searchResults.items[0];
					if (item.snippet.liveBroadcastContent === "upcoming") {
						this.error("Can't play a stream that has not started yet.", message.channel);
						return;
					}
					entry.channelLink = "https://youtube.com/watch?v=" + item.id.channelId;
					entry.channelName = AllHtmlEntities.decode(item.snippet.channelTitle);
					entry.imgUrl = item.snippet.thumbnails.high.url;
					entry.live = item.snippet.liveBroadcastContent === "live";
					entry.title = AllHtmlEntities.decode(item.snippet.title);
					entry.url = "https://youtube.com/watch?v=" + item.id.videoId;
					vidID = item.id.videoId;
				}
			}

			const video: any = await nodeFetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${vidID}&key=${process.env.YOUTUBE_API_KEY}`);
			const videoDetails: any = await video.json();
			if (videoDetails.error || !videoDetails.items || videoDetails.items.length == 0) {
				this.warn("API Error. Added to queue with limited informations", message.channel);
			} else {
				const item = videoDetails.items[0];
				entry.channelLink = "https://youtube.com/channel/" + item.snippet.channelId;
				entry.channelName = AllHtmlEntities.decode(item.snippet.channelTitle);
				entry.imgUrl = item.snippet.thumbnails.high.url;
				entry.live = item.snippet.liveBroadcastContent === "live";
				entry.title = AllHtmlEntities.decode(item.snippet.title);
				const isoDuration = item.contentDetails.duration;
				const secs = (/(\d+)S/.test(isoDuration)) ? parseInt(/(\d+)S/.exec(isoDuration)[1]) : 0;
				const mins = (/(\d+)M/.test(isoDuration)) ? parseInt(/(\d+)M/.exec(isoDuration)[1]) : 0;
				const hours = (/(\d+)H/.test(isoDuration)) ? parseInt(/(\d+)H/.exec(isoDuration)[1]) : 0;
				const duration: number = secs * 1000 + mins * 1000 * 60 + hours * 1000 * 60 * 60;
				entry.duration = duration;
				entry.displayDuration = formatTinyDuration(duration);
			}
			player.queueAdd(entry);
			if (!player.playing) {
				player.play(player.queue.shift());
				message.channel.send("▶ Now playing: **" + player.current.title + "**");
				return;
			}
			const item: MusicQueueItem = player.queue[player.queue.length - 1];
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Queued", message.author.avatarURL())
				.setDescription(`**[${entry.title}](${entry.url})**`)
				.setImage(item.imgUrl)
				.addField("Channel", `[${entry.channelName}](${entry.channelLink})`, true)
				.addField("Position in queue", player.queue.length, true)
				.addField("Duration", entry.displayDuration, true);
			message.channel.send(embed);
		});
	}

}