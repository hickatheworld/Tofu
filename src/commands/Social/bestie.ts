import { Message, User, ReactionCollector } from "discord.js";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseUser } from "../../core/lib/Args";
import BotProfile from "../../core/typedefs/BotProfile";
import * as log from "../../core/lib/Log";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "bestie",
			desc: "Bestie with someone!",
			module: "Social",
			usages: [
				"<user: User>"
			]
		});
	}

	public async setup() {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const proposing: User = message.author;
			const proposed: User = parseUser(args[0], this.client);
			if (!proposed || !message.guild.members.cache.has(proposed.id)) {
				this.error("Can't find user.", message.channel);
				return;
			}
			const proposingProfile: BotProfile = await this.client.db.getProfile(proposing);
			const proposedProfile: BotProfile = await this.client.db.getProfile(proposed);
			if (proposingProfile.bestie) {
				this.error("You already have bestie, stay loyal.", message.channel)
				return;
			}
			if (proposedProfile.bestie) {
				this.error("This person already has a bestie.", message.channel)
				return;
			}
			if (proposed.bot) {
				this.error("You can't bestie a bot, duh.", message.channel)
				return;
			}
			if (proposed === proposing) {
				this.error("Being your own bestie is such a weird concept..", message.channel)
				return;
			}
			const proposition: Message = await message.channel.send(`${proposed.toString()}, ${proposing.toString()} wants to be your bestie! React with ✅ to accept or with ❎ to reject <:3yourefunny:722392186355712140>\n*You have 2 minutes.*`);
			await proposition.react("✅");
			await proposition.react("❎");
			const collector: ReactionCollector = new ReactionCollector(proposition, _ => true, { time: 120000 });
			collector.on("collect", (reaction, user) => {
				if (reaction.emoji.name !== "✅" && reaction.emoji.name !== "❎") {
					reaction.remove();
					return;
				}
				if (user !== proposed) return;
				if (reaction.emoji.name === "✅") {
					message.channel.send(`🙌 ${proposing.toString()}, ${proposed.toString()}, your are now besties!`);
					this.client.db.setUser(proposed, "bestie", proposing);
					this.client.db.setUser(proposing, "bestie", proposed);
					collector.stop();
					return;
				}
				if (reaction.emoji.name === "❎") {
					message.channel.send(`${proposing.toString()}, you got rejected...`);
					collector.stop();
					return;
				}
			});
			collector.on("end", (_collected, reason) => {
				if (reason === "time") {
					message.channel.send(`${proposing.toString()}, looks like you got ignored...`);
				}
			});

		});
	}

}