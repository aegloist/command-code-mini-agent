import { describe, expect, it } from "vitest";
import { runAgent } from "../src/agent.js";

describe("agent routing", () => {
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
});
