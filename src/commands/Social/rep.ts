import { Message, MessageEmbed, User } from "discord.js";
import * as cron from "node-cron";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";
import BotProfile from "../../core/typedefs/BotProfile";
import { formatDuration } from "../../core/lib/Time";
import * as log from "../../core/lib/Log";
import { REPUTATION_COLOR, REPUTATION_EMOTE } from "../../core/lib/Constants";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "rep",
			desc: "Give a reputation point to someone",
			module: "Social",
			usages: [
				"<user: User>"
			]
		});
	}

	public async setup(): Promise<void> {
		cron.schedule("0 0 0 * * *", () => {
			this.client.db.models.profiles.update({ canRep: true }, { where: { canRep: false } });
			log.info("Reset canRep property for all users.");
		});
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {

			const authorProfile: BotProfile = await this.client.db.getProfile(message.author);
			if (!authorProfile.canRep) {
				const next12: Date = new Date();
				next12.setDate(next12.getDate() + 1);
				next12.setHours(0, 0, 0, 0);
				const duration: string = formatDuration(new Date(), next12, true);
				this.error(`You can rep someone again in ${duration}`, message.channel);
				return;
			}

			const user: User = parseUser(args[0], this.client);
			if (!user) {
				this.error("Can't find user.", message.channel);
				return;
			}
			if (user.bot) {
				this.error("You can't rep a bot...", message.channel);
				return;
			}
			if (user === message.author) {
				this.error("You can't rep yourself...", message.channel);
				return;
			}
			const profile: BotProfile = await this.client.db.getProfile(user);
			await this.client.db.setUser(user, "rep", ++profile.rep);
			await this.client.db.setUser(message.author, "canRep", false);
			const embed: MessageEmbed = new MessageEmbed()
				.setColor(REPUTATION_COLOR)
				.setDescription(`${REPUTATION_EMOTE} | I gave a reputation point to ${user.toString()}!`);
			message.channel.send(embed);
		});
	}
}