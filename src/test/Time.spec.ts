import * as Time from "../core/lib/Time";
import { expect } from "chai";
import "mocha";

const date1: Date = new Date("2004/02/11 15:12:34");
const date2: Date = new Date("2004/03/14 19:14:35");

describe("Time.formatDigit", function () {
	it("should return 02", () => expect(Time.formatDigit(2)).to.equal("02"));
	it("should return 0002", () => expect(Time.formatDigit(2, 4)).to.equal("0002"));
	it("should return -5", () => expect(Time.formatDigit(-5)).to.equal("-5"));
});

describe("Time.formatDate", function () {
	it("should return 2004/02/11", () => expect(Time.formatDate(date1)).to.equal("2004/02/11"));
	it("should return 2004-02-11", () => expect(Time.formatDate(date1, "-")).to.equal("2004-02-11"));
});

describe("Time.formatTime", function () {
	it("should return 15:12", () => expect(Time.formatTime(date1, false, false)).to.equal("15:12"));
	it("should return 15:12:34", () => expect(Time.formatTime(date1, true, false)).to.equal("15:12:34"));
	it("should return 15:12:34.0000", () => expect(Time.formatTime(date1, true, true)).to.equal("15:12:34.0000"));
});

describe("Time.formatDuration", function () {
	it("should return 1 month, 2 days, 4 hours, 2 minutes, 1 second", () => expect(Time.formatDuration(date1, date2)).to.equal("1 month, 2 days, 4 hours, 2 minutes, 1 second"));
	it("should return **1** month, **2** days, **4** hours, **2** minutes, **1** second", () => expect(Time.formatDuration(date1, date2, true)).to.equal("**1** month, **2** days, **4** hours, **2** minutes, **1** second"));
});