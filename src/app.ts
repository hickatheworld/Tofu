import OCBot from "./core/base/Client";
require("dotenv").config();
const Instance: OCBot = new OCBot({
	admins: process.env.BOT_ADMINS.split(","),
	name: "OC Bot",
	description: "Once Community's bot.",
	owner: process.env.BOT_OWNER,
	prefix: process.env.BOT_PREFIX,
	test: process.env.BOT_TEST == "true",
	token: process.env.BOT_TOKEN
});
Instance.run();