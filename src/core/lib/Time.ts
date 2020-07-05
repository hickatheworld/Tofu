export const SECS_IN_MINUTE: number = 60;
export const SECS_IN_HOUR: number = SECS_IN_MINUTE * 60;
export const SECS_IN_DAY: number = SECS_IN_HOUR * 24;
export const SECS_IN_MONTH: number = SECS_IN_DAY * 30;
export const SECS_IN_YEAR: number = SECS_IN_MONTH * 12;

export function formatDigit(n: number, length: number = 2): string {
	if (length < 2) length = 2;
	const str: string = `${n}`;
	if (str.length >= length || n < 0) return `${n}`;
	return `${"0".repeat(length - str.length)}${n}`;

}

export function formatDate(d: Date, separator: string = "/") {
	const year: string = `${d.getFullYear()}`;
	const month: string = formatDigit(d.getMonth() + 1);
	const day: string = formatDigit(d.getDate());
	return `${year}${separator}${month}${separator}${day}`;
}

export function formatTime(d: Date, displaySeconds: boolean = true, displayMilliseconds: boolean = false) {
	const hours: string = formatDigit(d.getHours());
	const minutes: string = formatDigit(d.getMinutes());
	var output: string = `${hours}:${minutes}`;
	if (displaySeconds) {
		const seconds: string = formatDigit(d.getSeconds());
		output += `:${seconds}`;
	}
	if (displayMilliseconds) {
		const milliseconds: string = formatDigit(d.getMilliseconds(), 4);
		output += `.${milliseconds}`;
	}
	return output;
}

export function formatDuration(date1: Date, date2: Date, boldNumbers: boolean = false): string {
	const t1: number = date1.getTime();
	const t2: number = date2.getTime();

	var delta: number = Math.abs(t1 - t2) / 1000;

	const years: number = Math.floor(delta / SECS_IN_YEAR);
	delta -= years * SECS_IN_YEAR;

	const months: number = Math.floor(delta / SECS_IN_MONTH) % 12;
	delta -= months * SECS_IN_MONTH;

	const days: number = Math.floor(delta / SECS_IN_DAY) % 30;
	delta -= days * SECS_IN_DAY;

	const hours: number = Math.floor(delta / SECS_IN_HOUR) % 24;
	delta -= hours * SECS_IN_HOUR;

	const minutes: number = Math.floor(delta / SECS_IN_MINUTE) % 60;
	delta -= minutes * SECS_IN_MINUTE;

	const seconds: number = Math.floor(delta);

	var output: string = "";
	if (years > 0) output += `${years} year${(years > 1) ? "s" : ""}, `;
	if (months > 0) output += `${months} month${(months > 1) ? "s" : ""}, `;
	if (days > 0) output += `${days} day${(days > 1) ? "s" : ""}, `;
	if (hours > 0) output += `${hours} hour${(hours > 1) ? "s" : ""}, `;
	if (minutes > 0) output += `${minutes} minute${(minutes > 1) ? "s" : ""}, `;
	if (seconds > 0) output += `${seconds} second${(seconds > 1) ? "s" : ""}, `;
	if (boldNumbers) output = output.replace(/(\d+)/gi, "**$1**");
	output = output.slice(0, output.length - 2);
	return output;
}
