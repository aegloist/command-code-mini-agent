import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { discoverSkills, parseSkillMetadata } from "../src/skills.js";

describe("skill metadata", () => {
  it("parses frontmatter", () => {
    const raw = [
      "---",
      "name: welcome-me",
      "description: Use for onboarding prompts.",
      "---",
      "",
      "Body.",
    ].join("\n");

    expect(parseSkillMetadata(raw, "welcome-me", ".skills/welcome-me/SKILL.md")).toMatchObject({
      name: "welcome-me",
      description: "Use for onboarding prompts.",
    });
  });

  it("rejects mismatched names", () => {
    const raw = [
      "---",
      "name: welcome",
      "description: Use for onboarding prompts.",
      "---",
    ].join("\n");

    expect(() => parseSkillMetadata(raw, "welcome-me", ".skills/welcome-me/SKILL.md")).toThrow();
  });

  it("rejects names longer than 64 characters", () => {
    const longName = "a".repeat(65);
    const raw = [
      "---",
      `name: ${longName}`,
      "description: Use for onboarding prompts.",
      "---",
    ].join("\n");

    expect(() => parseSkillMetadata(raw, longName, `.skills/${longName}/SKILL.md`)).toThrow();
  });

  it("rejects descriptions longer than 1024 characters", () => {
    const raw = [
      "---",
      "name: welcome-me",
      `description: ${"a".repeat(1025)}`,
      "---",
    ].join("\n");

    expect(() => parseSkillMetadata(raw, "welcome-me", ".skills/welcome-me/SKILL.md")).toThrow();
  });
});

describe("skill discovery", () => {
  it("discovers skill folders", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "mini-agent-"));
    await mkdir(path.join(root, "welcome-me"));
    await writeFile(
      path.join(root, "welcome-me", "SKILL.md"),
      [
        "---",
        "name: welcome-me",
        "description: Use for onboarding prompts.",
        "---",
        "",
        "Body.",
      ].join("\n"),
    );

    const skills = await discoverSkills(root);
    expect(skills).toHaveLength(1);
    expect(skills[0]?.name).toBe("welcome-me");
  });
});
