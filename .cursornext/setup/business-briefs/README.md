# Business Briefs (Next.js Vibe Engineering)

## Purpose

Business briefs let you provide **business context** (purpose, rules, customization, success metrics) in ~10 minutes. The **Prompt Generator Agent** combines your brief with **Figma specs** (if available) and produces a single **prompt for the Planning Agent**, so you don't have to write a long prompt by hand.

## Files

| File | Use |
|------|-----|
| `business-brief-template.yaml` | Short generic template (legacy). |
| `business-brief-template-nextjs.yaml` | **Full Next.js template** — use this for new features. Copy and rename to `business-brief-{feature-name}.yaml`. |

## Flow

1. Copy `business-brief-template-nextjs.yaml` → `business-brief-{feature-name}.yaml`.
2. Fill the YAML (feature purpose, use cases, business rules, customization yes/no/maybe, success metrics).
3. Optional: run **@figma-analyzer** so `.cursornext/cache/figma-specs-{feature}.md` exists.
4. Invoke **@prompt-generator-agent** with feature name and/or path to your brief.
5. Agent writes `.cursornext/cache/prompt-{feature}.md`.
6. Use that file's contents as the prompt for **@planning-agent** → PRD.
7. Use **@coding-agent** with the PRD to implement.

## Tips

- Be specific about business rules (e.g. "Always exactly 3 cards", "Password min 8 chars").
- Use yes/no/maybe for customization so the generated prompt knows what's configurable.
- You don't need to specify design measurements — the agent gets those from Figma specs and maps them to COLORS and TYPOGRAPHY.
- Note which parts should be server-rendered vs interactive (client) so the PRD sets the right boundary.
