import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, MessageEmbed, GuildMember } from "discord.js";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "info",
			desc: "Gives informations about OC Bot",
			module: "OC Bot",
			aliases: ["ga"],
			whitelist: client.admins
		});
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const commit: string = require("child_process").execSync("git rev-parse HEAD");
			const color: number = message.guild.members.cache.get(this.client.user.id).roles.color.color;
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor(this.client.name, this.client.user.avatarURL())
				.setDescription(this.client.description)
				.setColor(color)
				.addField("Version", process.env.BOT_VERSION, true)
				.addField("Commit", `[${commit.toString().substr(0, 7)}](https://github.com/Hickacou/OC-Bot/commit/${commit})`, true)
				.addField("Creator", "**Hicka#3151**", true)
				.addField("Language", "Typescript", true)
				.addField("Library", "discord.js", true)
				.addField("Commands", `${this.client.commands.array().length}`, true)
				.setFooter(`Hosted on ${process.env.BOT_HOST} | Ping : ${this.client.ws.ping}ms`)
			message.channel.send(embed);
		});
	}

}