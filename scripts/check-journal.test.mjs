import { describe, expect, it } from "vitest";
import { checkLinear, journalEntries } from "./check-journal.mjs";

const entries = (...tags) => tags.map((tag, idx) => ({ idx, tag, when: 1000 + idx }));

describe("journalEntries", () => {
	it("treats a missing journal as empty", () => {
		expect(journalEntries(null)).toEqual([]);
	});

	it("reads the entries of a drizzle-kit journal", () => {
		const json = JSON.stringify({ version: "7", dialect: "sqlite", entries: entries("0000_a") });
		expect(journalEntries(json)).toEqual(entries("0000_a"));
	});

	it("rejects a journal without entries", () => {
		expect(() => journalEntries("{}")).toThrow();
	});
});

describe("checkLinear", () => {
	it("passes when neither side has a journal", () => {
		expect(checkLinear([], [])).toEqual({ linear: true });
	});

	it("passes when the branch equals the base", () => {
		expect(checkLinear(entries("0000_a"), entries("0000_a"))).toEqual({ linear: true });
	});

	it("passes when the branch appends to the base", () => {
		expect(checkLinear(entries("0000_a"), entries("0000_a", "0001_b"))).toEqual({ linear: true });
	});

	it("fails when the branch is behind the base", () => {
		expect(checkLinear(entries("0000_a", "0001_b"), entries("0000_a")).linear).toBe(false);
	});

	it("fails when two branches added a different migration at the same index", () => {
		const result = checkLinear(entries("0000_a", "0001_main"), entries("0000_a", "0001_mine"));
		expect(result.linear).toBe(false);
	});

	it("fails when the branch rewrote an applied migration", () => {
		expect(checkLinear(entries("0000_a"), entries("0000_changed", "0001_b")).linear).toBe(false);
	});

	it("fails when an applied migration was regenerated under the same tag", () => {
		const head = [{ idx: 0, tag: "0000_a", when: 9999 }];
		expect(checkLinear(entries("0000_a"), head).linear).toBe(false);
	});

	it("fails when indexes skip or repeat", () => {
		const head = [
			{ idx: 0, tag: "0000_a", when: 1000 },
			{ idx: 2, tag: "0002_c", when: 1002 },
		];
		expect(checkLinear(entries("0000_a"), head).linear).toBe(false);
	});
});
