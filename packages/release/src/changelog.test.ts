import { describe, expect, test } from "bun:test";
import { topSection, versionType } from "./changelog";

describe("topSection", () => {
    test("returns only the first section", () => {
        const markdown = "## v1.1.0\n- Added X\n\n## v1.0.0\n- Old\n";
        expect(topSection(markdown)).toBe("## v1.1.0\n- Added X");
    });

    test("handles indented headings", () => {
        expect(topSection("    ## v1.0.0-beta.2\n    - Added Y\n")).toBe(
            "## v1.0.0-beta.2\n    - Added Y",
        );
    });

    test("handles h1 headings", () => {
        expect(topSection("# v1.0.0\n\nInitial version.\n")).toBe("# v1.0.0\n\nInitial version.");
    });

    test("returns null without headings", () => {
        expect(topSection("no headings here\n")).toBeNull();
    });
});

describe("versionType", () => {
    test("maps prereleases", () => {
        expect(versionType("1.0.0-beta.2")).toBe("beta");
        expect(versionType("1.0.0-alpha.1")).toBe("alpha");
        expect(versionType("1.0.0")).toBe("release");
    });
});
