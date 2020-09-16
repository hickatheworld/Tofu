import { Message, MessageEmbed, ReactionCollector } from "discord.js";
import nodeFetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { capitalize } from "../../core/lib/utils";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "define",
			desc: "Gives informations about a word. Powered by [WordsAPI](https://https://www.wordsapi.com/)",
			module: "Utils",
			usages: [
				"<word: String>"
			],
			cooldown: 10000
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const word: string = (args[0] || "").toLowerCase();
			const res: any = await nodeFetch("https://wordsapiv1.p.rapidapi.com/words/" + word, {
				method: "GET",
				headers: {
					"x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
					"x-rapidapi-key": process.env.WORDS_API_KEY,
				}
			});
			var data: any;
			try {
				data = await res.json();
			} catch (err) {
				this.error("An error occured. The API is probably down.", message.channel);
				return;
			}
			if (data.success === false) {
				this.error("API call failed", message.channel, new Error(data.message));
				return;
			}
			var embeds: MessageEmbed[] = [];
			for (const i in data.results) {
				const result: any = data.results[i];
				const def: string = result.definition[0].toUpperCase() + result.definition.slice(1);
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
					.setTitle(`${capitalize(data.word)} - ${result.partOfSpeech}`)
					.setColor("ORANGE")
					.setDescription(`**${def}**`)
					.setFooter(`Definition ${parseInt(i) + 1}/${data.results.length}`);
				if (result.synonyms) embed.description += `\n\n**Synonyms:**\n${result.synonyms.join(", ")}`;
				if (result.examples) embed.description += `\n\n**Examples:**\n\`\`\`${result.examples.join("\n")}\`\`\``;
				embeds.push(embed);
			}
			const msg: Message = await message.channel.send(embeds[0]);
			if (embeds.length == 1) return;
			var currentPage: number = 0;
			await msg.react("⬅");
			await msg.react("➡");
			const collector: ReactionCollector = new ReactionCollector(msg, r => true, { idle: 60000 });
			collector.on("collect", (reaction, user) => {
				reaction.users.remove(user);
				if (user !== message.author) return;
				if (reaction.emoji.name === "⬅") {
					if (--currentPage < 0) currentPage = embeds.length - 1;
					msg.edit(embeds[currentPage]);
				}
				if (reaction.emoji.name === "➡") {
					if (++currentPage == embeds.length) currentPage = 0;
					msg.edit(embeds[currentPage]);
				}
			});
			collector.on("end", (_collected, _reason) => {
				msg.reactions.removeAll();
			});
		});
	}
}