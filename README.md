# Command Code Mini Agent

A small Node.js CLI agent that routes prompts through Open Agent Skills and Claude Sonnet.

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

```bash
npm start -- --debug "I'm new to this project, what should I do?"
```

## Submission Notes

Time spent: about 6-8 hours.

Challenges: getting skill routing right so metadata is loaded first and the full skill is loaded only after selection.

Demo instructions:

```bash
npm start -- --debug "I'm new to this project, what should I do?"
```

Example prompts:

```bash
npm start -- --debug "I'm new to this project, what should I do?"
npm start -- --debug "Write documentation for this CLI"
npm start -- --debug "what's the weather?"
```
