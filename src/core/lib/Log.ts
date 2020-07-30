import { GuildChannel, User, Guild, Role } from "discord.js";
import { formatDate, formatTime } from "./Time";
import chalk from "chalk";
import stripAnsi from "strip-ansi";
import { promises as fs, existsSync as exists } from "fs";
import path from "path";

enum LogType {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

async function save(message: string): Promise<void> {
	message = stripAnsi(message);
	const dirPath: string = path.join(__dirname, "../../../", "logs");
	if (!exists(dirPath)) {
		await fs.mkdir(dirPath);
	}
	await fs.appendFile(path.join(dirPath, `${formatDate(new Date(), "-")}.log`), message + "\n");
}

async function print(message: string, type: LogType, write: boolean): Promise<void> {
	var out: string = "";
	out += chalk.green(`${formatDate(new Date())} ${formatTime(new Date(), true, true)} `);
	switch (type) {
		case 0:
			out += chalk.bgWhite.black("DEBUG");
			break;
		case 1:
			out += chalk.bgCyan("INFO");
			break;
		case 2:
			out += chalk.bgYellow("WARN");
			break;
		case 3:
			out += chalk.bgRed("ERROR");
			break;
	}
	out += " : ";
	out += message;
	if (type !== 0 && write) {
		await save(out);
	}
	console.log(out);
}

export function channel(c: GuildChannel): string {
	return chalk.green(`#${c.name}`);
}

export function user(u: User): string {
	return chalk.cyan(`${u.tag} (${u.id})`);
}

export function role(r: Role): string {
	return chalk.red(`${r.name} (${r.id})`);
}

export function number(n: number): string {
	return chalk.magenta(`${n}`);
}

export function text(s: string): string {
	return chalk.underline.yellow(s);
}

export function bool(b: boolean): string {
	return chalk.greenBright(b);
}

export function guild(guild: Guild): string {
	return chalk.underline(`${guild.name} (${guild.id})`);
}

export function debug(...message: string[]) {
	print(message.join(" "), LogType.DEBUG, false);
}

export function info(...message: string[]) {
	print(message.join(" "), LogType.INFO, true);
}

export function warn(...message: string[]) {
	print(chalk.yellow(message.join(" ")), LogType.WARN, true);
}

export function error(...message: string[]) {
	print(chalk.red(message.join(" ")), LogType.ERROR, true);
}