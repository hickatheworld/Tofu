import { Collection, Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { AllHtmlEntities } from "html-entities";
import Command from "../../core/base/Command";
import Tofu from "../../core/base/Client";
import Trivia from "../../core/typedefs/Trivia";
import { shuffleArray } from "../../core/lib/utils";
import { TriviaColors, TRIVIA_LETTERS } from "../../core/lib/Constants";
import { formatDigit } from "../../core/lib/Time";
import { parseNumber } from "../../core/lib/Args";

export = class extends Command {
	public categories: Collection<number, string>;
	public categoriesEmbed: MessageEmbed;
	constructor(client: Tofu) {
		super(client, {
			name: "trivia",
			desc: "Gets you a trivia question. Powered by [Open Trivia Database](https://opentdb.com/)",
			usages: [
				"[category: Number | String] [difficulty: 'Easy' | 'Normal' | 'Hard']",
				"[difficulty: 'Easy' | 'Normal' | 'Hard']",
				"categories"
			],
			module: "Fun",
			cooldown: 10000
		});
		this.categories = new Collection();
	}

	public async setup(): Promise<void> {
		this.categoriesEmbed = new MessageEmbed()
			.setTitle(`${this.client.prefix}trivia`)
			.setColor("5cff82")
			.setDescription(`Use \`${this.client.prefix}trivia [category]\` to have a question about the specified category.\nIt can be either the id or a part of the name of a category.\nIf the specified word matches multiple categories, a random matching category will be chosen.\n`);
		const res: any = await fetch("https://opentdb.com/api_category.php").then(async res => (await res.json()).trivia_categories);
		for (const i of res) {
			this.categories.set(i.id, i.name);
			this.categoriesEmbed.description += `\`${formatDigit(i.id)}\` **${i.name}**\n`
		}
		this.categoriesEmbed.description = this.categoriesEmbed.description.slice(0, this.categoriesEmbed.description.length - 1);
		this.categories = this.categories.mapValues(c => c.toLowerCase());
	}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			if (args[0] && args[0] === "categories") {
				message.channel.send(this.categoriesEmbed);
				return;
			}
			const diffs: string[] = ["easy", "medium", "hard"];
			var query: string = "https://opentdb.com/api.php?amount=1";
			if (args[0] && diffs.includes(args[0].toLowerCase())) {
				query += `&difficulty=${args.shift().toLowerCase()}`;
			} else {
				const argNum: number = parseNumber(args[0]);
				const word: string = (args[0]) ? args.shift().toLowerCase() : "";
				if (this.categories.has(argNum)) {
					query += `&category=${argNum}`;
				} else if (word.length > 0 && this.categories.find(c => c.includes(word))) {
					const category: number = this.categories.filter(c => c.includes(word)).randomKey();
					query += `&category=${category}`;
				} else if (word.length > 0) message.channel.send("*The specified word doesn't match any category*");
				if (args[0] && diffs.includes(args[0].toLowerCase())) {
					query += `&difficulty=${args[0].toLowerCase()}`;
				}
			}
			const res: any = await fetch(query).then(async res => (await res.json()).results[0]);
			const decode: Function = new AllHtmlEntities().decode;
			var answers: string[] = res.incorrect_answers.concat(res.correct_answer);
			for (const i in answers) {
				answers[i] = decode(answers[i]);
			}
			answers = shuffleArray(answers);
			const index = answers.indexOf(decode(res.correct_answer));
			const trivia: Trivia = {
				answers: answers,
				correct: index,
				difficulty: res.difficulty,
				question: decode(res.question),
			}

			var questions: string = "";
			for (const i in answers) {
				questions += `\n${TRIVIA_LETTERS[i]} ${answers[i]}`;
			}
			const questionEmbed: MessageEmbed = new MessageEmbed()
				.setAuthor(res.category)
				.setColor(TriviaColors[res.difficulty.toUpperCase() as keyof typeof TriviaColors])
				.setTitle(trivia.question)
				.setDescription(questions)
				.setFooter(`Difficulty : ${res.difficulty[0].toUpperCase() + res.difficulty.slice(1)}`);
			await message.channel.send(questionEmbed);
			setTimeout(() => {
				const answerEmbed: MessageEmbed = new MessageEmbed()
					.setDescription(`${TRIVIA_LETTERS[trivia.correct]} **${trivia.answers[trivia.correct]}**`)
					.setColor(TriviaColors.CORRECT)
					.setAuthor("Correct answer")
				message.channel.send(answerEmbed);
			}, 10000);
		});
	}
} 