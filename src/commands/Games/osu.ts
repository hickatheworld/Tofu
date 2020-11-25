import { Collection, Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import { AlphabetEmotes, OsuModesEmotes, OsuRanksEmotes as ore } from "../../core/lib/Constants";
import { formatNumber } from "../../core/lib/utils";
import { formatDuration } from "../../core/lib/Time";
require("dotenv").config();
export = class extends Command {
	public modes: Collection<number, string[]>;
	public modeIcons: string[];
	public displayModes: string[];
	private key: string;
	constructor(client: Tofu) {
		super(client, {
			name: "osu",
			desc: "Get data from osu!.",
			usages: [
				"<user: String|Number> [mode: String|Number]",
				"modes"
			],
			module: "Games"
		});
		this.modes = new Collection();
		this.modes.set(0, ["0", "std", "standard", "osu"]);
		this.modes.set(1, ["1", "taiko"]);
		this.modes.set(2, ["2", "ctb", "catch", "fruits"]);
		this.modes.set(3, ["3", "mania"]);
		this.displayModes = ["", "taiko", "catch", "mania"];
		this.modeIcons = [];
		for (const mode of OsuModesEmotes) {
			const id: string = /<:.+:(\d{18,})>/.exec(mode)[1];
			this.modeIcons.push(`https://cdn.discordapp.com/emojis/${id}.png`);
		}
		this.key = process.env.OSU_API_KEY;
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			args = args.map(a => a.toLowerCase());
			if (args[0] === "modes") {
				message.channel.send(`__osu! modes__\n${OsuModesEmotes[0]} - standard\n${OsuModesEmotes[1]} - taiko\n${OsuModesEmotes[2]} - catch\n${OsuModesEmotes[3]} - mania`);
			} else {
				const username: string = args.shift();
				const n: Function = formatNumber;
				var mode: number = this.modes.findKey((m) => m.includes(args[0])) || 0;
				const res: any[] = await (await fetch(`https://osu.ppy.sh/api/get_user?k=${this.key}&u=${username}&m=${mode}`)).json();
				if (res.length < 1) {
					this.error("This player doesn't exist", message.channel);
					return;
				}
				const user: any = res[0];
				const flag: string = `${AlphabetEmotes[user.country[0] as keyof typeof AlphabetEmotes]}${AlphabetEmotes[user.country[1] as keyof typeof AlphabetEmotes]}`;
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(`osu!${this.displayModes[mode]}`, this.modeIcons[mode], `https://osu.ppy.sh/users/${user.user_id}`)
					.setThumbnail(`https://a.ppy.sh/${user.user_id}?.png`)
					.setColor("FF66AB")
					.setTitle(`${user.username} - Level ${Math.floor(user.level)}`)
					.addFields([
						{ name: "Playtime", value: formatDuration(new Date(Date.now() + user.total_seconds_played * 1000), new Date(), true), inline: false },
						{ name: "Games played", value: `${n(user.playcount)}`, inline: true },
						{ name: "Ranked Score", value: `${n(user.ranked_score)}`, inline: true },
						{ name: "Total Score", value: `${n(user.total_score)}`, inline: true },
						{ name: "Rank", value: `#${n(user.pp_rank)} (${flag} #${n(user.pp_country_rank)})`, inline: true },
						{ name: "PP", value: `${Math.floor(user.pp_raw)}`, inline: true },
						{ name: "Accuracy", value: `${parseFloat(user.accuracy).toFixed(2)}%`, inline: true },
						{ name: "Ranks", value: `${ore.A} ${n(user.count_rank_a)} ${ore.S} ${n(user.count_rank_s)} ${ore.SH} ${n(user.count_rank_sh)} ${ore.X} ${n(user.count_rank_ss)} ${ore.XH} ${n(user.count_rank_ssh)}`, inline: false }
					])
					.setFooter("Player since", "https://upload.wikimedia.org/wikipedia/commons/d/d3/Osu%21Logo_%282015%29.png")
					.setTimestamp(new Date(user.join_date));
				message.channel.send(embed);
			}
		});
	}
}