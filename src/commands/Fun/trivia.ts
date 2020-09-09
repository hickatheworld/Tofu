import { Message } from "discord.js";	
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
			module: "Fun"	
		});	
	}	

	public async setup(): Promise<void> { }	

	public async exe(message: Message, args: string[]): Promise<void> {	
		super.check(message, async () => {	
			const decode: Function = new AllHtmlEntities().decode;	
			const res: any = await fetch("https://opentdb.com/api.php?amount=1").then(async res => (await res.json()).results[0]);	
			console.log(res);	
			var answers: string[] = res.incorrect_answers.concat(res.correct_answer);	
			for (const i in answers) {	
				answers[i] = decode(answers[i]);	
			}	
			answers = shuffleArray(answers);	
			const index = answers.indexOf(decode(res.correct_answer));	
			console.log(index);	
			console.log(answers);	
			const trivia: Trivia = {	
				answers: answers,	
				correct: index,	
				difficulty: res.difficulty,	
				question: decode(res.question),	
			}	
			const letters: string[] = ["🇦", "🇧", "🇨", "🇩"];	
			var msg: string = `Difficulty : *${trivia.difficulty}*\n**${trivia.question}**`;	
			for (const i in answers) {	
				msg+=`\n${letters[i]} ${answers[i]}`;	
			}	
			await message.channel.send(msg);	
			setTimeout(() => {	
				message.channel.send(`Answer : ${letters[trivia.correct]} **${trivia.answers[trivia.correct]}**`);	
			}, 10000);	
		});	
	}	
} 