import { Guild, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import MusicQueueItem from "../typedefs/MusicQueueItem";
import ytdl = require("ytdl-core");
import OCBot from "./Client";

export default class AudioPlayer {
	public channel: VoiceChannel;
	public guild: Guild;
	public queue: MusicQueueItem[];
	public current?: MusicQueueItem;
	public loop: boolean;
	public paused: boolean;
	public partial: boolean;
	public playing: boolean;
	private client: OCBot;
	private connection: VoiceConnection;
	private dispatcher: StreamDispatcher;
	private leaveTimeout: NodeJS.Timeout;
	constructor(client: OCBot, channel: VoiceChannel) {
		this.client = client;
		this.channel = channel;
		this.guild = channel.guild;
		this.loop = false;
		this.playing = false;
		this.partial = false;
		this.paused = false;
		this.queue = [];
		if (!this.channel.speakable || !this.channel.joinable) {
			throw new Error("MISSING_PERMS");
		}
	}

	public async join(): Promise<void> {
		this.connection = await this.channel.join();
		this.guild.me.voice.setSelfDeaf(true);
		this.connection.on("disconnect", () => {
			this.leave();
		});
	}

	public async leave(): Promise<void> {
		this.channel.leave();
		this.client.audioPlayers.delete(this.guild.id);
	}

	public queueAdd(item: MusicQueueItem): MusicQueueItem[] {
		this.queue.push(item);
		return this.queue;
	}
	public queueRemove(index: number): MusicQueueItem[] {
		this.queue = this.queue.slice(0, index).concat(this.queue.slice(index + 1, this.queue.length));
		return this.queue;
	}

	public async play(song: MusicQueueItem): Promise<void> {
		if (!this.connection) await this.join();
		this.playing = true;
		this.paused = false;
		this.dispatcher = this.connection.play(ytdl(song.url, {
			quality: "highestaudio",
			filter: "audioonly",
			highWaterMark: 1 << 25
		}))
		this.dispatcher.once("finish", () => {
			if (this.loop) {
				this.play(this.current);
			} else if (this.queue.length > 0) this.play(this.queue.shift());
			else {
				this.playing = false;
				this.current = null;
				this.startLeaveTimeout(6e5)
			}
		});
		this.dispatcher.on("error", (err) => {
			throw err;
		});
		this.current = song;
	}

	public pause(): void {
		if (!this.dispatcher) return;
		this.dispatcher.pause();
		this.paused = true;

	}

	public resume(): void {
		if (!this.dispatcher) return;
		this.dispatcher.resume();
		this.paused = false;
	}

	public skip(): void {
		if (!this.dispatcher) return;
		var wasLoop: boolean = false;
		if (this.loop) {
			this.loop = false;
			wasLoop = true;
		}
		this.dispatcher.emit("finish");
		if (wasLoop) this.loop = true;

	}

	get streamTime(): number {
		return this.dispatcher.streamTime;
	}

	public startLeaveTimeout(duration: number): void {
		this.leaveTimeout = setTimeout(() => { this.leave() }, duration);
	}
	public clearLeaveTimeout(): void {
		clearTimeout(this.leaveTimeout);
		this.leaveTimeout = null;
	}

}