type argumentType = "number" | "string" | "role" | "user" | "channel" | "member";

export default interface Argument {
	name: string,
	required: boolean,
	type: argumentType
}