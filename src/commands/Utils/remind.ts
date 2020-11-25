import { Collection, Guild, Message, TextChannel, User } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import { parseDuration } from "../../core/lib/Args";
import Reminder from "../../core/typedefs/Reminder";
import { Model } from "sequelize/types";
import * as log from "../../core/lib/Log";

export = class extends Command {
	public reminders: Collection<number, Reminder>;
	public timeouts: Collection<number, NodeJS.Timeout>;
	constructor(client: Tofu) {
		super(client, {
			name: "remind",
			desc: "Reminds you what you want it to remind you.",
			module: "Utils",
			usages: [
				"[in] <duration: Duration> [to] <reminder: String>"
			],
			aliases: ["remindme", "reminder"]
		});
		this.reminders = new Collection();
		this.timeouts = new Collection();
	}

	public async setup(): Promise<void> {
		const models: any[] = (await this.client.db.models.reminders.findAll()).map(m => m.toJSON());
		for (const model of models) {
			const user: User = await this.client.users.fetch(model.user);
			const guild: Guild = await this.client.guilds.fetch(model.guild);
			const channel: TextChannel = await (guild) ? guild.channels.resolve(model.channel) as TextChannel : null;
			if (!user || !guild || !channel) {
				this.client.db.models.reminders.destroy({ where: { id: model.id } });
				log.warn(`Missing property => Deleted reminder ${log.number(model.id)}`);
				continue;
			}
			this.reminders.set(model.id, {
				channel: channel,
				guild: guild,
				reminder: model.reminder,
				user: user,
				when: model.when
			});
			this.setupReminder(model.id);
		}
		log.info("Setup reminders.");
	}

	public async exe(message: Message, args: string[]) {
		if (args.length < 1) {
			this.client.commands.get("help").exe(message, ["remind"]);
			return;
		}
		if (args[0].toLowerCase() === "in") args.shift();
		const duration: number = parseDuration(args.shift());
		if (!duration) {
			this.error("Incorrect duration.", message.channel, new Error("Correct duration format: {days}d{hours}h{minutes}m{seconds}s"));
			return;
		}
		if (args.length > 1 && args[0].toLowerCase() === "to") args.shift();
		const what: string = args.join(" ").trim();
		if (!what) {
			this.error("Please set a reminder", message.channel);
			return;
		}
		const reminder: Reminder = {
			channel: message.channel as TextChannel,
			guild: message.guild,
			reminder: what,
			user: message.author,
			when: new Date(Date.now() + duration)
		};
		const model: Model = await this.client.db.models.reminders.create({
			channel: reminder.channel.id,
			guild: reminder.guild.id,
			reminder: reminder.reminder,
			user: reminder.user.id,
			when: reminder.when
		});
		const id: number = (model.toJSON() as any).id;
		this.reminders.set(id, reminder);
		this.setupReminder(id);
		message.channel.send("Sure, I'll remind you!");
	}


	public setupReminder(id: number): void {
		const reminder: Reminder = this.reminders.get(id);
		const duration: number = reminder.when.getTime() - Date.now();
		this.timeouts.set(id, setTimeout(async () => {
			try {
				await reminder.channel.send(`⏰ ${reminder.user}, **${reminder.reminder}**`);
			} catch (err) {
				try {
					await reminder.user.send(`⏰ **${reminder.reminder}**`);
				} catch (e) { /* pass */ }
			}
			this.client.db.models.reminders.destroy({ where: { id: id } });
			this.reminders.delete(id);
			this.timeouts.delete(id);
		}, duration));
	}
}