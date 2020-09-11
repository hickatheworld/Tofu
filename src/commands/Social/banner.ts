import { Message } from "discord.js";
import { createCanvas, loadImage, Image, Canvas, PNGStream } from "canvas";
import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { parseLink } from "../../core/lib/Args";
import { WriteStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "banner",
			desc: "Sets your profile banner.\nIt is recommanded to provide a 4:1 image. In all cases, it will be cropped to fit this aspect ratio.",
			usages: [
				"<image: Attachment>",
				"<image: Link>"
			],
			module: "Social"
		});
	}

	public async setup(): Promise<void> { }

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {
			var link: string;
			if (message.attachments.array().length < 1) {
				if (!parseLink(args[0])) {
					this.error("Please provide an image as a link or attachment.", message.channel)
					return;
				}
				link = parseLink(args[0]);

			} else {
				link = message.attachments.first().url;
			}
			if (link.endsWith(".gif")) {
				this.warn("**You can't set a gif as your banner.** It will be frozen on your profile", message.channel);
			}
			var img: Image;
			try {
				img = await loadImage(link);
			} catch (err) {
				this.error("An error occured", message.channel, err);
				return;
			}
			const canvas: Canvas = createCanvas(800, 200);
			const ctx = canvas.getContext("2d");
			if (img.width / img.height > 4) {
				const height: number = 200;
				const width: number = 200 * img.width / img.height;
				ctx.drawImage(img, 400 - width / 2, 0, width, height);
			}
			else {
				const width: number = 800;
				const height: number = 800 * img.height / img.width;
				ctx.drawImage(img, 0, 100 - height / 2, width, height);
			}
			if (!existsSync(join(__dirname, "../../../assets/img/banners"))) {
				mkdirSync(join(__dirname, "../../../assets/img/banners"));
			}
			const outStream: WriteStream = createWriteStream(join(__dirname, "../../../assets/img/banners", `user_${message.author.id}.png`))
			outStream.on("error", (err) => {
				this.error("An error occured", message.channel, err);
			});
			outStream.on("finish", () => {
				this.success(`Sucessfully set your new banner! You can check it with \`${this.client.prefix}profile\``, message.channel);
			});
			canvas.createPNGStream().pipe(outStream);
		});
	}

}