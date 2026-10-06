import { describe, expect, it } from "vitest";
import { findDatabaseId } from "./d1-id.mjs";

const databases = [
	{ name: "setter-diary", uuid: "prod-id" },
	{ name: "setter-diary-pr-1", uuid: "pr-1-id" },
	{ name: "setter-diary-pr-12", uuid: "pr-12-id" },
];

describe("findDatabaseId", () => {
	it("finds a database by its exact name", () => {
		expect(findDatabaseId(databases, "setter-diary-pr-1")).toBe("pr-1-id");
		expect(findDatabaseId(databases, "setter-diary")).toBe("prod-id");
	});

	it("returns an empty string when no database has that name", () => {
		expect(findDatabaseId(databases, "setter-diary-pr-2")).toBe("");
		expect(findDatabaseId([], "setter-diary")).toBe("");
	});
});
