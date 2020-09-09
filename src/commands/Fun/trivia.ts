import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { AllHtmlEntities } from "html-entities";
import Trivia from "../../core/typedefs/Trivia";
import { shuffleArray } from "../../core/lib/utils";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "trivia",
			desc: "Gets you a trivia question. Powered by [Open Trivia Database](https://opentdb.com/)",
			module: "Fun",
			cooldown: 10000
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			const decode: Function = new AllHtmlEntities().decode;
			const res: any = await fetch("https://opentdb.com/api.php?amount=1").then(async res => (await res.json()).results[0]);
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
			const letters: string[] = ["🇦", "🇧", "🇨", "🇩"];
			const colors: any = {
				"easy": "GREEN",
				"medium": "ORANGE",
				"hard": "RED"
			};

			var questions: string = "";
			for (const i in answers) {
				questions += `\n${letters[i]} ${answers[i]}`;
			}
			const questionEmbed: MessageEmbed = new MessageEmbed()
				.setAuthor(res.category)
				.setColor(colors[res.difficulty])
				.setTitle(trivia.question)
				.setDescription(questions)
				.setFooter(`Difficulty : ${res.difficulty[0].toUpperCase() + res.difficulty.slice(1)}`);
			await message.channel.send(questionEmbed);
			setTimeout(() => {
				const answerEmbed: MessageEmbed = new MessageEmbed()
					.setDescription(`${letters[trivia.correct]} **${trivia.answers[trivia.correct]}**`)
					.setColor("GREEN")
					.setAuthor("Correct answer")
				message.channel.send(answerEmbed);
			}, 10000);
		});
	}
} 