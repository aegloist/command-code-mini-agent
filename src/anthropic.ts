import Anthropic from "@anthropic-ai/sdk";
import type { LoadedSkill, SkillMetadata } from "./skills.js";

export type SkillRoute = {
  skill: string | null;
};

const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function selectSkillWithClaude(prompt: string, skills: SkillMetadata[]): Promise<SkillRoute> {
  if (process.env.MOCK_CLAUDE === "true") {
    return mockRoute(prompt);
  }

  const client = createClient();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
    max_tokens: 200,
    temperature: 0,
    system: [
      "Select at most one skill from the supplied catalog.",
      "Use a skill only when the user prompt clearly matches that skill's description.",
      "If the prompt is unrelated or uncertain, return null.",
      "Return only JSON like {\"skill\":\"welcome-me\"} or {\"skill\":null}.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          prompt,
          skills: skills.map(({ name, description }) => ({ name, description })),
        }),
      },
    ],
  });

  return parseRoute(extractText(response.content));
}

export async function generateResponseWithClaude(prompt: string, selectedSkill: LoadedSkill | null): Promise<string> {
  if (process.env.MOCK_CLAUDE === "true") {
    return mockResponse(prompt, selectedSkill);
  }

  const client = createClient();
  const skillContext = selectedSkill
    ? `Selected skill: ${selectedSkill.name}\n\n${selectedSkill.content}`
    : "Selected skill: none";

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
    max_tokens: 1200,
    temperature: 0.2,
    system: [
      "Answer the user directly.",
      "If a skill is provided, follow the skill instructions exactly.",
      "If no skill is provided, do not mention unloaded skills.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: `${skillContext}\n\nUser prompt:\n${prompt}`,
      },
    ],
  });

  return extractText(response.content).trim();
}

function createClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required unless MOCK_CLAUDE=true");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function extractText(content: Anthropic.Messages.Message["content"]): string {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

function parseRoute(raw: string): SkillRoute {
  const normalized = stripCodeFences(raw).trim();

  try {
    const parsed = JSON.parse(normalized);
    if (parsed && (typeof parsed.skill === "string" || parsed.skill === null)) {
      return { skill: parsed.skill };
    }
  } catch {
    return { skill: null };
  }

  return { skill: null };
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/^```(?:json)?\n([\s\S]*?)\n```$/i);
  return fenceMatch?.[1] ?? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

function mockRoute(prompt: string): SkillRoute {
  const normalized = prompt.toLowerCase();
  if (
    normalized.includes("new to this project") ||
    normalized.includes("i'm new") ||
    normalized.includes("im new") ||
    normalized.includes("new here") ||
    normalized.includes("welcome me") ||
    (normalized.includes("project") && normalized.includes("what should i do"))
  ) {
    return { skill: "welcome-me" };
  }
  if (normalized.includes("changelog") || normalized.includes("release note")) {
    return { skill: "changelog-generator" };
  }
  if (normalized.includes("code review") || normalized.includes("review feedback")) {
    return { skill: "receiving-code-review" };
  }
  return { skill: null };
}

function mockResponse(prompt: string, selectedSkill: LoadedSkill | null): string {
  if (selectedSkill?.name === "welcome-me") {
    return [
      "> Welcome to our Command Code assignment agent!",
      "",
      "- Install dependencies.",
      "- Set `ANTHROPIC_API_KEY`.",
      "- Run the CLI.",
    ].join("\n");
  }

  return selectedSkill ? `Mock response using ${selectedSkill.name} for: ${prompt}` : `Mock response for: ${prompt}`;
}
