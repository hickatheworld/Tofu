import { Message, MessageEmbed } from "discord.js";
import { readFileSync } from "fs";
import { join } from "path";
import { promise as glob } from "glob-promise";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";

interface sourceStats {
	files: number,
	characters: number,
	lines: number
};

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "stats",
			desc: "Gives stats about OC Bot, exclusively for Hicka to flex.",
			module: "OC Bot",
			aliases: ["flex"]
		});

	}

	public async setup(): Promise<void> {
		this.commands = this.client.commands.size;
		this.srcStats = await this.getSourceStats();
		this.buildStats = await this.getSourceStats(true);
		this.dependencies = Object.keys(require("../../../package.json").dependencies).length;
		this.lockDependencies = Object.keys(require("../../../package-lock.json").dependencies).length;
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const guilds: number = this.client.guilds.cache.size;
			const users: number = this.client.users.cache.size;
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor("flex purposes only")
				.setTitle("OC Bot stats")
				.addFields([
					{
						name: "Guilds",
						value: guilds,
						inline: true,
					},
					{
						name: "Users",
						value: users,
						inline: true
					},
					{
						name: "Commands",
						value: this.commands,
						inline: true
					},
					{
						name: "File stats - Source files",
						value: `In **${this.srcStats.files}** files`,
						inline: false,
					},
					{
						name: "Lines of code",
						value: this.srcStats.lines,
						inline: true
					},
					{
						name: "Number of characters",
						value: this.srcStats.characters,
						inline: true
					},
					{
						name: "File stats - Compiled files",
						value: `In **${this.srcStats.files}** files`,
						inline: false,
					},
					{
						name: "Lines of code",
						value: this.buildStats.lines,
						inline: true
					},
					{
						name: "Number of characters",
						value: this.buildStats.characters,
						inline: true
					},
					{
						name: "npm Dependencies",
						value: `For a total of **${this.dependencies + this.lockDependencies}**`,
						inline: false
					},
					{
						name: "From package.json",
						value: this.dependencies,
						inline: true
					},
					{
						name: "From package-lock.json",
						value: this.lockDependencies,
						inline: true
					}
				])
				.setColor("GREEN");
			message.channel.send(embed);
		});
	}

	public async getSourceStats(compiled = false): Promise<sourceStats> {
		var files: number = 0;
		var characters: number = 0;
		var lines: number = 0;
		const basePath: string = "../../../" + ((compiled) ? "build" : "src");
		const path: string = join(__dirname, basePath, "/**/**." + ((compiled) ? "js" : "ts"));
		const matches: string[] = await glob(path);
		files = matches.length;
		for (const file of matches) {
			const content: string = readFileSync(file, { encoding: "utf-8" });
			characters += content.length;
			lines += content.split("\n").length;
		}
		return {
			files: files,
			characters: characters,
			lines: lines
		};
	}

}