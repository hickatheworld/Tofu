import { Guild, VoiceState } from "discord.js";
import AudioPlayer from "../core/base/AudioPlayer";
import BotEvent from "../core/base/BotEvent";
import Tofu from "../core/base/Client";

export = class extends BotEvent {
	constructor(client: Tofu) {
		super(client, "voiceStateUpdate");
	}

	public exe(oldState: VoiceState, newState: VoiceState): void {
		const guild: Guild = newState.guild;
		if (!this.client.audioPlayers.has(guild.id)) return;
		const player: AudioPlayer = this.client.audioPlayers.get(guild.id);
		if (oldState.channel !== player.channel && newState.channel !== player.channel) return;
		if (player.channel.members.size <= 1) player.startLeaveTimeout(5e5);
		else player.clearLeaveTimeout();
	}
}