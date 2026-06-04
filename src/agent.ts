import { generateResponseWithClaude, selectSkillWithClaude } from "./anthropic.js";
import { discoverSkills, findSkillByName, loadSkill } from "./skills.js";

export type AgentResult = {
  response: string;
  discoveredSkills: string[];
  selectedSkill: string | null;
  loadedSkill: string | null;
};

export async function runAgent(prompt: string, skillsRoot = ".skills"): Promise<AgentResult> {
  const skills = await discoverSkills(skillsRoot);
  const route = await selectSkillWithClaude(prompt, skills);
  const selectedMetadata = findSkillByName(skills, route.skill);
  const loadedSkill = selectedMetadata ? await loadSkill(selectedMetadata) : null;
  const response = await generateResponseWithClaude(prompt, loadedSkill);

  return {
    response,
    discoveredSkills: skills.map((skill) => skill.name),
    selectedSkill: selectedMetadata?.name ?? null,
    loadedSkill: loadedSkill?.name ?? null,
  };
}
