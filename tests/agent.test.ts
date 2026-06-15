import { afterEach, describe, expect, it } from "vitest";
import { runAgent } from "../src/agent.js";

describe("agent routing", () => {
  afterEach(() => {
    delete process.env.MOCK_CLAUDE;
  });

  it("selects welcome-me for onboarding prompts", async () => {
    process.env.MOCK_CLAUDE = "true";

    const result = await runAgent("I'm new to this project, what should I do?");

    expect(result.selectedSkill).toBe("welcome-me");
    expect(result.loadedSkill).toBe("welcome-me");
    expect(result.response.startsWith("> Welcome to our Command Code assignment agent!")).toBe(true);
  });

  it("selects no skill for unrelated prompts", async () => {
    process.env.MOCK_CLAUDE = "true";

    const result = await runAgent("what's the weather?");

    expect(result.selectedSkill).toBeNull();
    expect(result.loadedSkill).toBeNull();
  });

  it("selects changelog-generator for changelog prompts", async () => {
    process.env.MOCK_CLAUDE = "true";

    const result = await runAgent("Create release notes from these commits");

    expect(result.selectedSkill).toBe("changelog-generator");
    expect(result.loadedSkill).toBe("changelog-generator");
  });

  it("selects receiving-code-review for review feedback prompts", async () => {
    process.env.MOCK_CLAUDE = "true";

    const result = await runAgent("I received code review feedback, help me evaluate it");

    expect(result.selectedSkill).toBe("receiving-code-review");
    expect(result.loadedSkill).toBe("receiving-code-review");
  });
});
