import { MessageEmbed, Message } from "discord.js";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";

export = class extends Command {
	constructor(client: Tofu) {
		super(client, {
			name: "help",
			desc: "Gives you the command lists of the bot or help about a given command",
			module: "Tofu",
			usages: [
				"[command: String]"
			],
			aliases: ["commands", "command"]
		});
	}

	public async setup(): Promise<void> {
		const embed: MessageEmbed = new MessageEmbed()
			.setAuthor("Tofu Help", this.client.user.avatarURL())
			.setTitle("Commands list")
			.setDescription(`Feel free to suggest new commands!\nType \`${this.client.prefix}${this.name} [command]\` to have specific help for a command.`)
			.setColor("5cff82")
			.setFooter(`${this.client.commands.array().length} commands`);
		;
		for (const module of this.client.modules.keyArray()) {
			var list: string = "";
			for (const cmd of this.client.modules.get(module)) {
				console.log(cmd);
				const command: Command = this.client.commands.get(cmd);
				if (!command.hidden) list += `\`${cmd}\` `;
			}
			embed.addField(`**${module}**`, list, false);
		}
		this.props.set("list", embed);
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const name: string = args[0] && args[0].toLowerCase();
			if (name === null || (!this.client.commands.has(name) && !this.client.aliases.has(name))) {
				message.channel.send(this.props.get("list"));
				return;
			}
			const command: Command = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
			const usages: string = (command.usages) ? command.usages.map(u => `${this.client.prefix}${command.name} ${u}`).join("\n") : `${this.client.prefix}${command.name}`
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("Tofu Help", this.client.user.avatarURL())
				.setTitle(`${this.client.prefix}${command.name}`)
				.setDescription(`${command.desc}\n\`\`\`${usages}\`\`\``)
				.setColor("5cff82")
				.addField("Module", command.module, true)
				.setFooter(`This command was used ${await this.client.db.getCommandUses(command.name)} times`);
			if (command.aliases.length > 0) embed.addField("**Aliases**", command.aliases.map(a => `__${a}__`).join(", "), true);
			message.channel.send(embed);
		});
	}
}