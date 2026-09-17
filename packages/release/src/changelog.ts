export type VersionType = "release" | "beta" | "alpha";

export function versionType(version: string): VersionType {
    const value = version.toLowerCase();
    if (value.includes("alpha")) return "alpha";
    if (value.includes("beta")) return "beta";
    return "release";
}

export function topSection(markdown: string): string | null {
    const isHeading = (line: string) => /^#+\s/.test(line.trimStart());
    const lines = markdown.split("\n");
    const start = lines.findIndex(isHeading);
    if (start === -1) return null;

    const body = lines.slice(start + 1);
    const end = body.findIndex(isHeading);
    const section = end === -1 ? body : body.slice(0, end);

    return [lines[start]!.trim(), ...section].join("\n").trimEnd();
}
