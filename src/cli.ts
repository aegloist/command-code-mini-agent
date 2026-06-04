#!/usr/bin/env node

import "dotenv/config";
import { runAgent } from "./agent.js";

const args = process.argv.slice(2);
const debug = args.includes("--debug");
const prompt = args.filter((arg) => arg !== "--debug").join(" ").trim();

if (!prompt) {
  console.log('Usage: npm start -- [--debug] "your prompt"');
  process.exitCode = 1;
} else {
  try {
    const result = await runAgent(prompt);

    if (debug) {
      console.log(`Discovered skills: ${result.discoveredSkills.join(", ")}`);
      console.log(`Selected skill: ${result.selectedSkill ?? "none"}`);
      console.log(`Loaded full skill: ${result.loadedSkill ?? "none"}`);
      console.log("");
    }

    console.log(result.response);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
