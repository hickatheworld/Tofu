import { MessageEmbed, Message, GuildMember, User } from "discord.js";
import { existsSync as exists } from "fs";
import { join } from "path";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import { formatDuration } from "../../core/lib/Time";
import { parseUser } from "../../core/lib/Args";
import BotProfile from "../../core/typedefs/BotProfile";
import { ProfileEmotes } from "../../core/lib/Constants";
import UserOwoInfo from "../../core/typedefs/UserOwoInfo";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "profile",
			desc: "Displays or edits an user's profile",
			module: "Social",
			cooldown: 10000,
			usages: [
				"[user: User]",
				"desc <description: String>",
				"title <user: User> <title: String> (Admin only)"
			]
		});
	}
	public async setup() { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const subcommand: string = (args[0]) ? args[0].toLowerCase() : null;
			if (subcommand === "desc") {
				args.shift();
				const desc: string = args.join(" ");
				if (desc.length > 55) {
					this.error("Your description must be 55 characters or less.", message.channel);
					return;
				}
				await this.client.db.setUser(message.author, "desc", desc);
				this.success(`Set your description to : ${desc}`, message.channel);
				return;
			}
			if (subcommand === "title") {
				if (!this.client.admins.includes(message.author.id)) {
					this.error("Only admins can change your **tofu** title", message.channel);
					return;
				}
				args.shift();
				const user: User = parseUser(args[0], this.client);
				if (!user) {
					this.error("Can't find user.", message.channel);
					return;
				}
				args.shift();
				const title: string = args.join(" ");
				await this.client.db.setUser(user, "title", title);
				this.success(`Set ${user.toString()}'s title to : ${title}`, message.channel);
				return;
			}
			var member: GuildMember;
			var u: User;
			if ((u = parseUser(args[0], this.client)) && message.guild.members.cache.has(u.id)) member = message.guild.members.cache.get(u.id);
			else member = message.member;
			if (member.user.bot) {
				this.error("Bots don't have a profile!", message.channel);
				return;
			}
			const profile: BotProfile = await this.client.db.getProfile(member.user);
			const owos: UserOwoInfo = await this.client.db.fetchOwoInfo(member.user);
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`${member.user.username}'s profile`)
				.setDescription(`**Tofu** title — ${profile.title}`)
				.setThumbnail(member.user.avatarURL({ dynamic: true }))
				.addField(ProfileEmotes.SERVER_AGE + " Server age", formatDuration(member.joinedAt, new Date(), true), false)
				.addField(ProfileEmotes.BESTIE + " Bestie", (profile.bestie) ? `**${profile.bestie.tag}**` : `*Nobody*`, false)
				.addField(ProfileEmotes.COOKIES + " Cookies", `**${profile.cookies}**`, true)
				.addField(ProfileEmotes.REPUTATION + " Reputation", `**${profile.rep}**`, true)
				.addField(ProfileEmotes.OWO + " owos", `**${(owos) ? owos.gotten.length : 0}**/${this.client.commands.get("owo").totalOwos}`, true)
				.setColor("E73863")
				.setFooter(`Used ${profile.uses} commands`, this.client.user.avatarURL())
				;
			if (profile.desc) embed.addField("_ _", `${profile.desc}`, false);
			if (exists(join(__dirname, `../../../assets/img/banners/user_${member.user.id}.png`))) {
				embed.attachFiles([`assets/img/banners/user_${member.user.id}.png`]);
				embed.setImage(`attachment://user_${member.user.id}.png`);
			} else {
				embed.attachFiles([`assets/img/default_banner.png`]);
				embed.setImage("attachment://default_banner.png");
			}
			message.channel.send(embed);
		});
	}
}