import { Guild, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import MusicQueueItem from "../typedefs/MusicQueueItem";
import ytdl = require("ytdl-core");

export default class AudioPlayer {
	public channel: VoiceChannel;
	public guild: Guild;
	public queue: MusicQueueItem[];
	public paused: boolean;
	public playing: boolean;
	private connection: VoiceConnection;
	private dispatcher: StreamDispatcher;
	constructor(channel: VoiceChannel) {
		this.channel = channel;
		this.guild = channel.guild;
		this.playing = false;
		this.paused = false;
		this.queue = [];
	}

	public async join(): Promise<void> {
		this.connection = await this.channel.join();
	}

	public async leave(): Promise<void> {
		this.channel.leave();
		this.connection = null;
		this.dispatcher = null;
	}

	public queueAdd(item: MusicQueueItem): MusicQueueItem[] {
		this.queue.push(item);
		return this.queue;
	}
	public queueRemove(index: number): MusicQueueItem[] {
		this.queue = this.queue.slice(0, index).concat(this.queue.slice(index + 1, this.queue.length));
		return this.queue;
	}

	public async play(audio: MusicQueueItem): Promise<void> {
		if (!this.connection) await this.join();
		this.playing = true;
		this.paused = false;
		this.dispatcher = this.connection.play(ytdl(audio.url, {
			quality: "highestaudio",
			filter: "audioonly",
			highWaterMark: 1 << 25
		}))
		this.dispatcher.once("finish", () => {
			console.log("finish");
			if (this.queue.length > 0) this.play(this.queue.shift());
			else this.playing = false;
		});
		this.dispatcher.on("error", (err) => {
			throw err;
		});
	}

	public pause(): void {
		if (!this.dispatcher) return;
		this.dispatcher.pause();
		this.playing = false;
		this.paused = true;
		
	}

	public resume(): void {
		if (!this.dispatcher) return;
		this.dispatcher.resume();
		this.paused = false;
		this.playing = true;
	}

	public skip(): void {
		if (!this.dispatcher) return;
		this.dispatcher.emit("finish");
	}
}