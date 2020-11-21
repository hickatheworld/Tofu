import { existsSync, mkdirSync } from "fs";
import Tofu from "./core/base/Client";
require("dotenv").config();

if (!existsSync("temp")) {
	mkdirSync("temp");
}

const Instance: Tofu = new Tofu({
	admins: process.env.BOT_ADMINS.split(","),
	name: "Tofu",
	description: "Another multi purpose bot",
	owner: process.env.BOT_OWNER,
	prefix: process.env.BOT_PREFIX,
	test: process.env.BOT_TEST == "true",
	token: process.env.BOT_TOKEN
});
Instance.run();