import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type SkillMetadata = {
  name: string;
  description: string;
  directory: string;
  skillPath: string;
};

export type LoadedSkill = SkillMetadata & {
  content: string;
};

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;

export async function discoverSkills(skillsRoot = ".skills"): Promise<SkillMetadata[]> {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skills = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
        const raw = await readSkillFile(skillPath);
        if (raw === null) return null;
        return parseSkillMetadata(raw, entry.name, skillPath);
      }),
  );

  return skills.filter((skill): skill is SkillMetadata => skill !== null).sort((a, b) => a.name.localeCompare(b.name));
}

async function readSkillFile(skillPath: string): Promise<string | null> {
  try {
    return await readFile(skillPath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export function parseSkillMetadata(raw: string, directory: string, skillPath: string): SkillMetadata {
  const parsed = matter(raw);
  const name = parsed.data.name;
  const description = parsed.data.description;

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error(`${skillPath} is missing required frontmatter field "name"`);
  }

  if (typeof description !== "string" || description.trim() === "") {
    throw new Error(`${skillPath} is missing required frontmatter field "description"`);
  }

  if (!NAME_PATTERN.test(name)) {
    throw new Error(`${skillPath} has invalid skill name "${name}"`);
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`${skillPath} skill name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`${skillPath} description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`);
  }

  if (name !== directory) {
    throw new Error(`${skillPath} frontmatter name "${name}" must match parent directory "${directory}"`);
  }

  return { name, description, directory, skillPath };
}

export async function loadSkill(metadata: SkillMetadata): Promise<LoadedSkill> {
  const content = await readFile(metadata.skillPath, "utf8");
  return { ...metadata, content };
}

export function findSkillByName(skills: SkillMetadata[], name: string | null): SkillMetadata | null {
  if (name === null) return null;
  return skills.find((skill) => skill.name === name) ?? null;
}
