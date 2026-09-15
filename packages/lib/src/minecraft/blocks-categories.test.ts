import { expect, test } from "bun:test";
import { LOG, WOOL, searchBlock } from "./blocks-categories";

test("keywords match whole words and ignore a trailing s", () => {
	expect(searchBlock("sand")).not.toContain("sandstone");
	expect(searchBlock("brick")).toContain("stone_bricks");
	expect(searchBlock("planks")).toContain("oak_planks");
});

test("rules are exclusive and a group matches any keyword", () => {
	expect(searchBlock("wood", "!stripped")).not.toContain("stripped_oak_wood");
	expect(searchBlock(["wood", "hyphae"])).toContain("oak_wood");
	expect(searchBlock(["wood", "hyphae"])).toContain("crimson_hyphae");
	expect(searchBlock(["wood", "hyphae"])).not.toContain("oak_log");
});

test("categories collect single families", () => {
	expect(WOOL.length).toBeGreaterThan(0);
	expect(WOOL.every((block) => block.endsWith("_wool"))).toBe(true);
	expect(LOG.length).toBeGreaterThan(0);
	expect(LOG.every((block) => block.endsWith("_log"))).toBe(true);
});
