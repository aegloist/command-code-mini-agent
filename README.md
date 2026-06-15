# Mini Agent

A small Node.js CLI agent that routes prompts through Open Agent Skills and Claude Sonnet.

The CLI uses progressive disclosure:

1. Read skill names and descriptions from `.skills/*/SKILL.md`.
2. Ask Claude to select one skill or no skill using only that metadata.
3. Load the full selected `SKILL.md` only after selection.
4. Generate the final response with the selected skill context.

## Setup

```bash
npm install
cp .env.example .env
```

Set `ANTHROPIC_API_KEY` in `.env` for real Claude runs.

For deterministic local testing:

```bash
MOCK_CLAUDE=true npm test
```

## Run

Real Claude mode:

```bash
npm start -- --debug "I'm new to this project, what should I do?"
```

Mock mode does not call Claude and does not require `ANTHROPIC_API_KEY`.

```bash
MOCK_CLAUDE=true npm start -- --debug "I'm new to this project, what should I do?"
```

After `npm run build` and `npm link`, you can also run the installed CLI as:

```bash
mini-agent --debug "I'm new to this project, what should I do?"
```

## Skills

- `welcome-me`
- `changelog-generator`
- `receiving-code-review`

## Submission Notes

Time spent: about 2-4 hours.

Challenges:

- keeping the router limited to skill metadata first
- loading the full skill file only after Claude selected a skill
- making sure `welcome-me` is not loaded for unrelated prompts
- handling Claude router output if it returns JSON inside a code fence

Demo instructions:

```bash
npm start -- --debug "I'm new to this project, what should I do?"
```

Example prompts:

```bash
npm start -- --debug "I'm new to this project, what should I do?"
npm start -- --debug "Create release notes from these commits: feat: add login, fix: handle missing token"
npm start -- --debug "what's the weather?"
```

Expected debug behavior:

- onboarding prompt: `Selected skill: welcome-me`, `Loaded full skill: welcome-me`
- changelog prompt: `Selected skill: changelog-generator`, `Loaded full skill: changelog-generator`
- weather prompt: `Selected skill: none`, `Loaded full skill: none`
