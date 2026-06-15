# Reducing Token Usage in Cursor

A practical guide to keeping context small, requests cheap, and the agent fast. Token cost is driven almost entirely by **how much context the model has to read** on every turn. Smaller, focused context = cheaper, faster, and more accurate responses.

> **Rule of thumb:** The model re-reads the conversation + attached context on *every* message. A bloated chat costs more with each turn, not just once.

---

## 1. Start fresh chats often

- **One task = one chat.** Open a new chat when you switch features or topics. Long chats re-send the entire history every turn.
- Use **"New Chat"** instead of continuing an unrelated thread — the old messages keep costing tokens otherwise.
- For multi-step work, summarize the outcome and start clean rather than scrolling a 50-message thread.

---

## 2. Be precise with `@` context

- Attach **specific files** (`@path/to/file.tsx`) instead of whole folders (`@src/`). A folder pulls in every file's content.
- Avoid `@Codebase` / broad semantic search unless you genuinely need repo-wide discovery — it injects many chunks.
- Reference exact symbols or line ranges when you can, so the model reads less.
- Remove stale attachments from the chat once they're no longer relevant.

---

## 3. Scope your prompts

- Tell the agent **which files to touch** ("edit only `src/screens/Login`") so it doesn't go exploring and reading half the repo.
- Ask narrow questions. "Why does this function return null?" beats "review my code."
- Provide the answer if you already know it (file path, function name) instead of making the agent search.

---

## 4. Pick the right model

- Use **smaller/faster models** (e.g. lightweight or "fast" variants) for simple edits, renames, and Q&A.
- Reserve **large reasoning models** for genuinely hard problems. They cost far more per token.
- Match the model to the task — most day-to-day edits don't need the biggest model.

---

## 5. Trim what the agent auto-reads

- **`.cursorignore`** — exclude files the agent should never read (build output, `node_modules`, lock files, generated code, large assets, `.env`). This keeps them out of context and indexing.
- **`.cursorindexignore`** — exclude paths from semantic indexing only.
- Keep **binary/heavy artifacts out of the repo** (screenshots, videos, `.mp4`/`.png` test artifacts). They bloat git and search even if not read directly.

---

## 6. Keep rules and docs lean

- Rules in `.cursor/rules/*.mdc` are injected into context. **Long, always-applied rules are paid for on every turn.**
- Prefer **scoped rules** (glob-based `if:` conditions) over `alwaysApply: true` so they only load when relevant.
- Split huge rule files; keep each focused. Trim duplication and verbose examples.
- Same applies to `AGENTS.md` / project docs the agent reads automatically.

---

## 7. Manage long-running agent workflows

- In multi-agent pipelines, let each agent **read only the log it needs**, not every log. Point it at one file.
- Archive or delete per-feature logs (PRD, coding, fixing) once a feature ships — old logs that get re-attached cost tokens.
- Don't paste large logs/stack traces into chat; save them to a file and reference the relevant slice.

---

## 8. Avoid re-sending large outputs

- Don't ask the agent to print entire files back to you — ask for the diff or the specific change.
- Avoid pasting big JSON blobs, full terminal dumps, or whole log files inline. Trim to the relevant lines.
- For images/screenshots, attach only when visual context is truly needed (they consume significant tokens).

---

## 9. Use the cheapest tool for the job

- For "where is X defined," a quick search or jump-to-definition is cheaper than a full agent investigation.
- Use **Ask mode** for questions (no edits = tighter, read-only context) and **Agent mode** only when you want changes.
- Disable MCP servers/tools you aren't using — their tool descriptors and outputs add context.

---

## 10. Recommendations for *this* repo's agent system

This project runs a 12-agent pipeline (`.cursor/agents/`) with a "one agent → one task → one stop" design. That design is already token-friendly *if you use it as intended*. Concrete recommendations:

### Invoke one agent per chat
- The workflow is **explicitly** "one agent, one task, one stop" (see `agent-workflow-rules.mdc`). Honor that in chats too: **start a new chat for each agent**.
- Do **not** run `@figma-analyzer` → `@planning-agent` → `@coding-agent` in a single long thread. Each handoff re-sends all prior agent output every turn.
- Each agent already reads its inputs from files and writes outputs to files, so a fresh chat loses nothing — the next agent just reads the previous log.

### Watch the always-applied rules (these load on EVERY turn)
- `agent-workflow-rules.mdc` (`alwaysApply: true`, ~113 lines) and `figma-to-react-native.mdc` (`alwaysApply: true`, ~70 lines) are injected into **every** request, regardless of task — plus the large folder-structure user rule.
- `figma-to-react-native.mdc` is only relevant to Figma/Coding agents. Consider switching it from `alwaysApply: true` to **glob-scoped** (e.g. `globs: src/**/*.{ts,tsx}`) so it stops loading during planning, testing, vulnerability, and PR chats.
- Keep `agent-workflow-rules.mdc` lean — it's the one rule that genuinely belongs everywhere, so trim duplication rather than expanding it.
- Good already: `react-native.mdc` and `detox-testing.mdc` are glob-scoped, so they only load for matching files. Keep new rules scoped the same way.

### Mind the large agent definition files
- Biggest agents: `agent-11-detox-testing.md` (~656 lines), `agent-00-figma-analyzer.md` (~414), `agent-04-fixing.md` (~384). Each is only read when you invoke that agent — fine — but **never `@`-mention several agents in one message**, or you load all of them at once.
- If an agent file keeps growing, move its verbose examples/templates into a separate file the agent reads only when needed.

### Point each agent at exact files
- When invoking, give the **exact** input path (e.g. `Implement PRD from .cursor/logs/prd-<feature>-<ts>.md`) so the agent reads one file instead of searching `.cursor/logs/` and pulling in many.
- Don't attach the whole `.cursor/logs/` folder — attach the single relevant PRD / coding log / test-cases file.

### Keep the logs system from bloating context
- Logs are the agent handoff memory — keep them, but **archive or delete per-feature logs once the feature's PR is merged** so they aren't re-attached later.
- **Gitignore the detox artifacts** — the `.png`/`.mp4` files under `.cursor/logs/detox-testing/**/artifacts/` add weight to the repo and search index with zero model value. Keep `test-results.md`, drop the media.

### Use the right mode per agent
- Read-only agents (`@code-scanning-agent`, `@vulnerability-agent`, `@pre-pr-validation-agent`) are advisory — run them in **Ask mode** for tighter, read-only context.
- Use **Agent mode** only for the agents that actually write files (scaffold, coding, documentation, fixing).

---

## Quick checklist

- [ ] New chat per task
- [ ] Attach specific files, not folders
- [ ] Scope the prompt to exact files/symbols
- [ ] Use a smaller model for simple work
- [ ] Maintain `.cursorignore` for noise/large files
- [ ] Keep rules scoped and short
- [ ] Reference logs/files instead of pasting them
- [ ] Keep binaries (png/mp4) out of the repo
- [ ] One agent per chat (don't chain agents in one thread)
- [ ] Make `figma-to-react-native.mdc` glob-scoped instead of always-applied
- [ ] Give agents exact log/PRD paths, not the whole `.cursor/logs/` folder
- [ ] Gitignore detox `.png`/`.mp4` artifacts
- [ ] Run advisory agents (scan/vuln/pre-PR) in Ask mode
